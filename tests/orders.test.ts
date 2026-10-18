import { beforeEach, describe, expect, it } from 'vitest'
import type { CreateOrderInput, Order, OrderResponse } from '../src/shared/orders'
import { createOrdersHandler, MAX_ORDERS, SESSION_COOKIE } from '../src/server/orders-handler'
import { MemoryOrderRepository } from '../src/server/order-repository'
import type { OrderRepository } from '../src/server/order-repository'

const origin = 'https://demo.example'
const input = (): CreateOrderInput => ({
  requestId: crypto.randomUUID(),
  customer: { name: 'Демо Покупатель', email: 'demo@example.com', phone: '+7 (999) 123-45-67' },
  delivery: 'pickup',
  address: '',
  items: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 },
  ],
})

describe('order API', () => {
  let repository: MemoryOrderRepository
  let handle: ReturnType<typeof createOrdersHandler>
  let cookie: string
  const request = (
    method = 'GET',
    path = '/api/orders',
    data?: unknown,
    session = cookie,
    extra: Record<string, string> = {},
  ) =>
    new Request(`${origin}${path}`, {
      method,
      headers: {
        ...(data !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(session ? { cookie: session } : {}),
        origin,
        ...extra,
      },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    })
  const create = async (body = input(), session = cookie) => {
    const response = await handle(request('POST', '/api/orders', body, session))
    return { response, ...((await response.json()) as OrderResponse) }
  }
  const update = (order: Order, status: string, version = order.version, session = cookie) =>
    handle(request('PATCH', `/api/orders/${order.id}`, { status, version }, session))

  beforeEach(async () => {
    repository = new MemoryOrderRepository()
    handle = createOrdersHandler(repository, { now: () => new Date('2026-10-18T12:00:00Z') })
    cookie = ''
    const response = await handle(request())
    cookie = response.headers.get('set-cookie')!.split(';')[0]
  })

  it('initializes an opaque HttpOnly secure session and does not cache PII', async () => {
    const response = await handle(request('GET', '/api/orders', undefined, ''))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ orders: [] })
    expect(response.headers.get('set-cookie')).toMatch(
      new RegExp(`^${SESSION_COOKIE}=[A-Za-z0-9_-]{43};`),
    )
    expect(response.headers.get('set-cookie')).toContain('HttpOnly; SameSite=Lax')
    expect(response.headers.get('set-cookie')).toContain('Secure')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it.each([
    ['pickup', 0],
    ['courier', 350],
    ['post', 450],
  ] as const)('uses authoritative prices and %s shipping', async (delivery, shipping) => {
    const body = {
      ...input(),
      delivery,
      address: 'Минск, Демо улица 1',
      total: 1,
      shipping: -1000,
      items: [
        { productId: 1, quantity: 2, price: 1 },
        { productId: 2, quantity: 1, price: 1 },
      ],
    }
    const { order, response } = await create(body)
    expect(response.status).toBe(201)
    expect(order.subtotal).toBe(5560)
    expect(order.shipping).toBe(shipping)
    expect(order.total).toBe(5560 + shipping)
    expect(order.items[0].unitPrice).toBe(2540)
    expect(order.status).toBe('new')
    expect(order.version).toBe(1)
    expect(order.address).toBe(delivery === 'pickup' ? '' : body.address)
    const list = await handle(request())
    expect((await list.json()).orders).toEqual([order])
  })

  it('returns field errors for invalid contacts, delivery and requestId', async () => {
    const response = await handle(
      request('POST', '/api/orders', {
        ...input(),
        requestId: 'x',
        customer: { name: 'A', email: 'wrong', phone: 'hello' },
        delivery: 'wrong',
        address: '',
      }),
    )
    expect(response.status).toBe(422)
    expect((await response.json()).fields).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        email: expect.any(String),
        phone: expect.any(String),
        address: expect.any(String),
        delivery: expect.any(String),
        requestId: expect.any(String),
      }),
    )
    expect((await (await handle(request())).json()).orders).toHaveLength(0)
  })

  it('requires a delivery address, but not for pickup', async () => {
    const { response } = await create({ ...input(), delivery: 'courier', address: '' })
    expect(response.status).toBe(422)
  })

  it.each(
    [
      [],
      [{ productId: 999, quantity: 1 }],
      [{ productId: 4, quantity: 1 }],
      [{ productId: 1, quantity: 0 }],
      [{ productId: 1, quantity: 21 }],
      [{ productId: 1, quantity: 1.5 }],
      [{ productId: '1', quantity: 1 }],
      [
        { productId: 1, quantity: 1 },
        { productId: 1, quantity: 1 },
      ],
    ].map((items) => ({ items })),
  )('rejects invalid/out-of-stock basket $items', async ({ items }) => {
    const response = await handle(request('POST', '/api/orders', { ...input(), items }))
    expect(response.status).toBe(422)
  })

  it('replays the same request without creating a second order', async () => {
    const body = input()
    const first = await create(body)
    const repeat = await create({ ...body, items: [...body.items].reverse() })
    expect(repeat.response.status).toBe(200)
    expect(repeat.replayed).toBe(true)
    expect(repeat.order.id).toBe(first.order.id)
    expect((await (await handle(request())).json()).orders).toHaveLength(1)
  })

  it('rejects reused idempotency key with changed content', async () => {
    const body = input()
    await create(body)
    const { response } = await create({ ...body, items: [{ productId: 1, quantity: 3 }] })
    expect(response.status).toBe(409)
  })

  it('handles concurrent duplicate submissions atomically', async () => {
    const body = input()
    const results = await Promise.all([create(body), create(body), create(body)])
    expect(results.map((result) => result.response.status).sort()).toEqual([200, 200, 201])
    expect(new Set(results.map((result) => result.order.id)).size).toBe(1)
    expect((await (await handle(request())).json()).orders).toHaveLength(1)
  })

  it('isolates sessions for reads, writes and idempotency', async () => {
    const body = input()
    const first = await create(body)
    const other = (await handle(request('GET', '/api/orders', undefined, ''))).headers
      .get('set-cookie')!
      .split(';')[0]
    expect(
      (await (await handle(request('GET', '/api/orders', undefined, other))).json()).orders,
    ).toEqual([])
    expect((await update(first.order, 'confirmed', 1, other)).status).toBe(404)
    const second = await create(body, other)
    expect(second.response.status).toBe(201)
    expect(second.order.id).not.toBe(first.order.id)
  })

  it('implements a versioned new -> confirmed -> shipped lifecycle with history', async () => {
    const { order } = await create()
    const confirmedResponse = await update(order, 'confirmed')
    expect(confirmedResponse.status).toBe(200)
    const confirmed = (await confirmedResponse.json()).order as Order
    expect(confirmed.version).toBe(2)
    expect(confirmed.history.map((entry) => entry.status)).toEqual(['new', 'confirmed'])
    expect((await update(order, 'cancelled')).status).toBe(409)
    const shippedResponse = await update(confirmed, 'shipped')
    const shipped = (await shippedResponse.json()).order as Order
    expect(shippedResponse.status).toBe(200)
    expect(shipped.version).toBe(3)
    expect((await update(shipped, 'cancelled')).status).toBe(409)
  })

  it('rejects skipped transitions, invalid statuses and terminal updates', async () => {
    const { order } = await create()
    expect((await update(order, 'shipped')).status).toBe(409)
    expect((await update(order, 'unknown')).status).toBe(422)
    expect((await update(order, 'confirmed', 0)).status).toBe(422)
    const cancelled = (await (await update(order, 'cancelled')).json()).order as Order
    expect((await update(cancelled, 'confirmed')).status).toBe(409)
  })

  it('allows only one concurrent status mutation per version', async () => {
    const { order } = await create()
    const responses = await Promise.all([update(order, 'confirmed'), update(order, 'cancelled')])
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409])
  })

  it('enforces the bounded session quota without rejecting valid replays', async () => {
    const first = input()
    await create(first)
    for (let index = 1; index < MAX_ORDERS; index++)
      expect((await create()).response.status).toBe(201)
    expect((await create()).response.status).toBe(429)
    expect((await create(first)).response.status).toBe(200)
    expect((await (await handle(request())).json()).orders).toHaveLength(MAX_ORDERS)
  })

  it('returns 503 rather than fake success if storage fails', async () => {
    const broken: OrderRepository = {
      read: async () => {
        throw new Error('offline')
      },
      write: async () => {
        throw new Error('offline')
      },
    }
    handle = createOrdersHandler(broken)
    expect((await handle(request())).status).toBe(503)
    const response = await handle(request('POST', '/api/orders', input()))
    expect(response.status).toBe(503)
    expect(await response.json()).not.toHaveProperty('order')
  })

  it('does not claim success when a write fails or conflicts repeatedly', async () => {
    handle = createOrdersHandler({
      read: async () => null,
      write: async () => {
        throw new Error('write failed')
      },
    })
    expect((await handle(request('POST', '/api/orders', input()))).status).toBe(503)
    handle = createOrdersHandler({ read: async () => null, write: async () => false })
    expect((await handle(request('POST', '/api/orders', input()))).status).toBe(409)
  })

  it('rejects cross-origin requests, unsupported methods and unknown routes', async () => {
    expect(
      (
        await handle(
          request('POST', '/api/orders', input(), cookie, { origin: 'https://evil.example' }),
        )
      ).status,
    ).toBe(403)
    expect(
      (
        await handle(
          request('POST', '/api/orders', input(), cookie, { 'sec-fetch-site': 'cross-site' }),
        )
      ).status,
    ).toBe(403)
    expect((await handle(request('DELETE'))).status).toBe(405)
    expect((await handle(request('GET', '/api/unknown'))).status).toBe(404)
    const { order } = await create()
    expect((await handle(request('GET', `/api/orders/${order.id}`))).status).toBe(405)
  })

  it('rejects malformed JSON, non-JSON, invalid root types and oversized bodies', async () => {
    expect(
      (
        await handle(
          new Request(`${origin}/api/orders`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', cookie },
            body: '{invalid',
          }),
        )
      ).status,
    ).toBe(400)
    expect(
      (await handle(new Request(`${origin}/api/orders`, { method: 'POST', body: 'hello' }))).status,
    ).toBe(415)
    expect((await handle(request('POST', '/api/orders', null))).status).toBe(400)
    expect(
      (await handle(request('POST', '/api/orders', { ...input(), extra: 'x'.repeat(17_000) })))
        .status,
    ).toBe(413)
    expect(
      (await handle(request('POST', '/api/orders', input(), cookie, { 'content-length': '17000' })))
        .status,
    ).toBe(413)
  })

  it('replaces malformed session cookies rather than accepting a chosen short token', async () => {
    const response = await handle(
      request('GET', '/api/orders', undefined, `${SESSION_COOKIE}=known`),
    )
    expect(response.headers.get('set-cookie')).not.toContain('=known;')
  })
})
