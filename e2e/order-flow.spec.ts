import { expect, test, type Page } from '@playwright/test'
import type { CreateOrderInput, OrderResponse, OrdersResponse } from '../src/shared/orders'

function demoOrder(): CreateOrderInput {
  return {
    requestId: crypto.randomUUID(),
    customer: { name: 'Покупатель Пример', email: 'buyer@example.com', phone: '+7 999 000-00-00' },
    delivery: 'pickup',
    address: '',
    items: [{ productId: 2, quantity: 2 }],
  }
}

async function captureAtTop(page: Page, path: string) {
  // Stabilize only the capture: the app intentionally scrolls after checkout,
  // while full-page screenshots can otherwise catch a sticky header mid-scroll.
  const style = await page.addStyleTag({
    content: 'html, body { scroll-behavior: auto !important; }',
  })
  try {
    await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
    await page.waitForFunction(() => window.scrollY === 0)
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }),
    )
    await page.screenshot({ path, fullPage: true, animations: 'disabled' })
  } finally {
    await style.evaluate((element) => {
      element.parentNode?.removeChild(element)
    })
  }
}

test('API сохраняет серверные суммы, повторяет запрос без дубля и изолирует сессии', async ({
  request,
  playwright,
  baseURL,
}) => {
  const session = await request.get('/api/orders')
  expect(session.ok()).toBeTruthy()
  expect(((await session.json()) as OrdersResponse).orders).toEqual([])

  const input = demoOrder()
  // Client totals/prices must not influence the authoritative server catalogue.
  const created = await request.post('/api/orders', {
    data: { ...input, total: 1, items: [{ productId: 2, quantity: 2, unitPrice: 1 }] },
  })
  expect(created.status()).toBe(201)
  const { order } = (await created.json()) as OrderResponse
  expect(order.subtotal).toBe(960)
  expect(order.shipping).toBe(0)
  expect(order.total).toBe(960)
  expect(order.status).toBe('new')
  expect(order.version).toBe(1)

  const repeated = await request.post('/api/orders', { data: input })
  expect(repeated.status()).toBe(200)
  expect(await repeated.json()).toMatchObject({ order: { id: order.id }, replayed: true })
  const listed = await request.get('/api/orders')
  expect(((await listed.json()) as OrdersResponse).orders).toHaveLength(1)

  const mismatch = await request.post('/api/orders', {
    data: { ...input, items: [{ productId: 2, quantity: 3 }] },
  })
  expect(mismatch.status()).toBe(409)

  const outsider = await playwright.request.newContext({ baseURL })
  try {
    expect(((await (await outsider.get('/api/orders')).json()) as OrdersResponse).orders).toEqual(
      [],
    )
    const denied = await outsider.patch(`/api/orders/${order.id}`, {
      data: { status: 'cancelled', version: 1 },
    })
    expect(denied.status()).toBe(404)
  } finally {
    await outsider.dispose()
  }

  const confirmed = await request.patch(`/api/orders/${order.id}`, {
    data: { status: 'confirmed', version: 1 },
  })
  expect(confirmed.ok()).toBeTruthy()
  expect(await confirmed.json()).toMatchObject({ order: { status: 'confirmed', version: 2 } })
  const stale = await request.patch(`/api/orders/${order.id}`, {
    data: { status: 'shipped', version: 1 },
  })
  expect(stale.status()).toBe(409)
  const shipped = await request.patch(`/api/orders/${order.id}`, {
    data: { status: 'shipped', version: 2 },
  })
  expect(shipped.ok()).toBeTruthy()
  const final = (await shipped.json()) as OrderResponse
  expect(final.order.history.map((entry) => entry.status)).toEqual(['new', 'confirmed', 'shipped'])
})

test('API отклоняет некорректный контакт, адрес и недоступный товар', async ({ request }) => {
  await request.get('/api/orders')
  const contact = await request.post('/api/orders', {
    data: { ...demoOrder(), customer: { name: '', email: 'wrong', phone: '' } },
  })
  expect(contact.status()).toBe(422)
  const address = await request.post('/api/orders', {
    data: { ...demoOrder(), delivery: 'courier', address: '' },
  })
  expect(address.status()).toBe(422)
  const unavailable = await request.post('/api/orders', {
    data: { ...demoOrder(), items: [{ productId: 4, quantity: 1 }] },
  })
  expect(unavailable.status()).toBe(422)
  expect(((await (await request.get('/api/orders')).json()) as OrdersResponse).orders).toEqual([])
})

test('покупатель проходит каталог → корзину → сохранённый заказ → историю статусов', async ({
  page,
}, testInfo) => {
  await page.goto('/#/catalog')
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Фильтр масляный W 712/75', exact: true }) })
  await card.getByRole('button', { name: 'В корзину', exact: true }).click()
  await page.goto('/#/cart')
  await expect(page.getByRole('heading', { name: 'Корзина', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Увеличить количество', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('spinbutton', { name: 'Количество', exact: true })).toHaveValue('2')
  await page.getByRole('link', { name: 'Оформить заказ', exact: true }).click()
  await page.getByLabel(/^Имя/).fill('Покупатель Пример')
  await page.getByLabel(/^Телефон/).fill('+7 999 000-00-00')
  await page.getByLabel(/^E-mail/).fill('buyer@example.com')
  await page.getByRole('radio', { name: /Самовывоз/ }).check()

  const responsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/api/orders') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click()
  const response = await responsePromise
  expect(response.status()).toBe(201)
  const { order } = (await response.json()) as OrderResponse
  expect(order.total).toBe(960)
  await expect(page.getByRole('heading', { name: 'Заказ оформлен', exact: true })).toBeVisible()
  await expect(page.getByTestId('order-id')).toContainText(order.id)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth + 1),
  )
  await captureAtTop(page, testInfo.outputPath('order-saved.png'))

  await page.goto('/#/orders')
  await expect(page.getByText(order.id, { exact: false })).toBeVisible()
  await page.reload()
  await expect(page.getByText(order.id, { exact: false })).toBeVisible()

  const own = await page.request.get('/api/orders')
  expect(
    ((await own.json()) as OrdersResponse).orders.some((item) => item.id === order.id),
  ).toBeTruthy()
  await page.getByRole('button', { name: /Подтвердить/ }).click()
  await expect(page.getByText('Подтверждён', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Отметить отправленным', exact: true }).click()
  await expect(page.getByText('Отправлен', { exact: true }).first()).toBeVisible()
  await page.reload()
  await expect(page.getByText('Отправлен', { exact: true }).first()).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth + 1),
  )
  await captureAtTop(page, testInfo.outputPath('order-history.png'))
})

test('при ошибке сохранения форма и корзина не теряются', async ({ page }) => {
  await page.goto('/#/catalog')
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Фильтр масляный W 712/75', exact: true }) })
  await card.getByRole('button', { name: 'В корзину', exact: true }).click()
  await page.goto('/#/checkout')
  await page.getByLabel(/^Имя/).fill('Покупатель Пример')
  await page.getByLabel(/^Телефон/).fill('+7 999 000-00-00')
  await page.getByLabel(/^E-mail/).fill('buyer@example.com')
  await page.getByRole('radio', { name: /Самовывоз/ }).check()
  await page.route('**/api/orders', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Тест: сервис временно недоступен' }),
      })
    } else {
      await route.continue()
    }
  })
  await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByLabel(/^E-mail/)).toHaveValue('buyer@example.com')
  await page.goto('/#/cart')
  await expect(
    page.getByRole('heading', { name: 'Фильтр масляный W 712/75', exact: true }),
  ).toBeVisible()
})
