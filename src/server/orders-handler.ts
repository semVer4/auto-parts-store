import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { orderCatalogue } from '../shared/catalog'
import { deliveryFees, orderStatuses } from '../shared/orders'
import type { ApiError, CreateOrderInput, Order, OrderStatus } from '../shared/orders'
import type { OrderRepository } from './order-repository'

export const SESSION_COOKIE = 'autodetal_demo_session'
export const MAX_ORDERS = 20
const MAX_BODY_BYTES = 16_384
const transitions: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: [],
  cancelled: [],
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message)
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function validateInput(value: unknown): CreateOrderInput {
  if (!isObject(value)) throw new HttpError(400, 'Ожидается объект заказа.')
  const fields: Record<string, string> = {}
  const customer = isObject(value.customer) ? value.customer : {}
  const name = text(customer.name)
  const email = text(customer.email).toLowerCase()
  const phone = text(customer.phone)
  const address = text(value.address)
  if (name.length < 2 || name.length > 80) fields.name = 'Укажите имя: от 2 до 80 символов.'
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    fields.email = 'Укажите корректный email.'
  const digits = phone.replace(/\D/g, '')
  if (phone.length > 30 || !/^[+\d\s()-]+$/.test(phone) || digits.length < 7 || digits.length > 15)
    fields.phone = 'Укажите корректный телефон: от 7 до 15 цифр.'
  const delivery = value.delivery
  if (typeof delivery !== 'string' || !Object.prototype.hasOwnProperty.call(deliveryFees, delivery))
    fields.delivery = 'Выберите способ получения.'
  if (address.length > 300 || (delivery !== 'pickup' && address.length < 5))
    fields.address = 'Укажите адрес: от 5 до 300 символов.'
  if (typeof value.requestId !== 'string' || !/^[A-Za-z0-9_-]{16,80}$/.test(value.requestId))
    fields.requestId = 'Некорректный идентификатор запроса. Обновите страницу.'
  const items: CreateOrderInput['items'] = []
  const seen = new Set<number>()
  if (
    !Array.isArray(value.items) ||
    value.items.length < 1 ||
    value.items.length > orderCatalogue.length
  ) {
    fields.items = 'Добавьте от 1 до 8 разных товаров.'
  } else {
    for (const item of value.items) {
      if (
        !isObject(item) ||
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.quantity)
      ) {
        fields.items = 'Некорректный товар или количество.'
        continue
      }
      const productId = item.productId as number
      const quantity = item.quantity as number
      const product = orderCatalogue.find((entry) => entry.id === productId)
      if (!product || !product.inStock || quantity < 1 || quantity > 20 || seen.has(productId))
        fields.items = 'Проверьте наличие товаров и количество (1–20).'
      seen.add(productId)
      items.push({ productId, quantity })
    }
  }
  if (Object.keys(fields).length) throw new HttpError(422, 'Проверьте поля заказа.', fields)
  return {
    requestId: value.requestId as string,
    customer: { name, email, phone },
    delivery: delivery as CreateOrderInput['delivery'],
    address: delivery === 'pickup' ? '' : address,
    items: items.sort((a, b) => a.productId - b.productId),
  }
}

async function readJson(request: Request): Promise<unknown> {
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
  )
    throw new HttpError(415, 'Используйте Content-Type: application/json.')
  const length = request.headers.get('content-length')
  if (length && Number(length) > MAX_BODY_BYTES) throw new HttpError(413, 'Слишком большой запрос.')
  const reader = request.body?.getReader()
  if (!reader) throw new HttpError(400, 'Пустой запрос.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break
      size += result.value.byteLength
      if (size > MAX_BODY_BYTES) {
        await reader.cancel()
        throw new HttpError(413, 'Слишком большой запрос.')
      }
      chunks.push(result.value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  } catch {
    throw new HttpError(400, 'Некорректный JSON.')
  }
}

function sessionFor(request: Request) {
  const raw = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1)
  const token = raw && /^[A-Za-z0-9_-]{43}$/.test(raw) ? raw : randomBytes(32).toString('base64url')
  const isNew = token !== raw
  const key = `session-${createHash('sha256').update(token).digest('hex')}`
  const cookie = isNew
    ? `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`
    : undefined
  return { key, cookie }
}

function checkOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    throw new HttpError(403, 'Запросы с другого сайта запрещены.')
}

function json(value: unknown, status: number, cookie?: string, extra?: Record<string, string>) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extra,
  })
  if (cookie) headers.set('Set-Cookie', cookie)
  return new Response(JSON.stringify(value), { status, headers })
}

export interface HandlerOptions {
  now?: () => Date
  id?: () => string
  onStorageError?: (error: unknown) => void
}

export function createOrdersHandler(repository: OrderRepository, options: HandlerOptions = {}) {
  const now = options.now ?? (() => new Date())
  const id = options.id ?? randomUUID
  return async (request: Request): Promise<Response> => {
    let cookie: string | undefined
    try {
      const path = new URL(request.url).pathname.replace(/\/$/, '')
      const collection = path === '/api/orders'
      const match = path.match(/^\/api\/orders\/([a-zA-Z0-9_-]{1,80})$/)
      if (!collection && !match) throw new HttpError(404, 'Маршрут не найден.')
      const allowed = collection ? ['GET', 'POST'] : ['PATCH']
      if (!allowed.includes(request.method))
        return json({ error: 'Метод не поддерживается.' }, 405, undefined, {
          Allow: allowed.join(', '),
        })
      checkOrigin(request)
      const session = sessionFor(request)
      cookie = session.cookie

      if (request.method === 'GET') {
        const snapshot = await repository.read(session.key)
        return json(
          { orders: (snapshot?.data.orders ?? []).map((entry) => entry.order).reverse() },
          200,
          cookie,
        )
      }

      const body = await readJson(request)
      if (request.method === 'POST') {
        const input = validateInput(body)
        const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex')
        const at = now().toISOString()
        const items = input.items.map((item) => {
          const product = orderCatalogue.find((product) => product.id === item.productId)!
          return {
            ...item,
            title: product.title,
            unitPrice: product.price,
            lineTotal: product.price * item.quantity,
          }
        })
        const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
        const shipping = deliveryFees[input.delivery]
        const order: Order = {
          id: id(),
          customer: input.customer,
          delivery: input.delivery,
          address: input.address,
          items,
          subtotal,
          shipping,
          total: subtotal + shipping,
          status: 'new',
          version: 1,
          createdAt: at,
          updatedAt: at,
          history: [{ status: 'new', at }],
        }
        for (let attempt = 0; attempt < 4; attempt++) {
          const snapshot = await repository.read(session.key)
          const entries = snapshot?.data.orders ?? []
          const previous = entries.find((entry) => entry.requestId === input.requestId)
          if (previous) {
            if (previous.fingerprint !== fingerprint)
              throw new HttpError(409, 'Этот идентификатор уже использован для другого заказа.')
            return json({ order: previous.order, replayed: true }, 200, cookie)
          }
          if (entries.length >= MAX_ORDERS)
            throw new HttpError(429, 'Достигнут лимит: не более 20 заказов.')
          if (
            await repository.write(
              session.key,
              { orders: [...entries, { requestId: input.requestId, fingerprint, order }] },
              snapshot?.etag ?? null,
            )
          )
            return json({ order }, 201, cookie)
        }
        throw new HttpError(409, 'Заказы изменились параллельно. Повторите запрос.')
      }

      if (
        !isObject(body) ||
        !Number.isInteger(body.version) ||
        (body.version as number) < 1 ||
        !orderStatuses.includes(body.status as OrderStatus)
      )
        throw new HttpError(422, 'Укажите корректный статус и версию заказа.')
      const snapshot = await repository.read(session.key)
      const entry = snapshot?.data.orders.find((entry) => entry.order.id === match![1])
      if (!snapshot || !entry) throw new HttpError(404, 'Заказ не найден.')
      if (entry.order.version !== body.version)
        throw new HttpError(409, 'Заказ уже изменён. Обновите список.')
      const nextStatus = body.status as OrderStatus
      if (!transitions[entry.order.status].includes(nextStatus))
        throw new HttpError(409, 'Такой переход статуса недоступен.')
      const at = now().toISOString()
      const updated: Order = {
        ...entry.order,
        status: nextStatus,
        version: entry.order.version + 1,
        updatedAt: at,
        history: [...entry.order.history, { status: nextStatus, at }],
      }
      const data = {
        orders: snapshot.data.orders.map((item) =>
          item.order.id === updated.id ? { ...item, order: updated } : item,
        ),
      }
      if (!(await repository.write(session.key, data, snapshot.etag)))
        throw new HttpError(409, 'Заказ уже изменён. Обновите список.')
      return json({ order: updated }, 200, cookie)
    } catch (error) {
      if (error instanceof HttpError) {
        const body: ApiError = {
          error: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        }
        return json(body, error.status, cookie)
      }
      // Do not log contacts, request body, session IDs or raw storage errors.
      options.onStorageError?.(error)
      return json(
        { error: 'Хранилище временно недоступно. Заказ не подтверждён; попробуйте позже.' },
        503,
        cookie,
      )
    }
  }
}
