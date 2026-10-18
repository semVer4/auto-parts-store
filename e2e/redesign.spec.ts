import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import type { CreateOrderInput, OrderResponse, OrdersResponse } from '../src/shared/orders'

const oilFilter = 'Фильтр масляный W 712/75'
const screenshots = resolve('output/design-preview')
const routes = [
  { name: 'home', path: '/' },
  { name: 'catalog', path: '/catalog' },
  { name: 'product', path: '/product/2' },
  { name: 'cart', path: '/cart' },
  { name: 'checkout', path: '/checkout' },
  { name: 'orders', path: '/orders' },
  { name: 'project', path: '/project' },
  { name: 'help', path: '/contacts' },
] as const

async function imagesLoaded(page: Page) {
  const images = page.locator('main img')
  for (let index = 0; index < (await images.count()); index++) {
    const image = images.nth(index)
    await image.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        image.evaluate((element) => {
          const imageElement = element as HTMLImageElement
          return imageElement.complete && imageElement.naturalWidth > 0
        }),
      )
      .toBeTruthy()
  }
}

async function screenshot(page: Page, name: string) {
  await mkdir(screenshots, { recursive: true })
  await imagesLoaded(page)
  const style = await page.addStyleTag({ content: 'html,body{scroll-behavior:auto!important}' })
  try {
    await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
    await page.waitForFunction(() => window.scrollY === 0)
    await page.evaluate(
      () =>
        new Promise<void>((done) => {
          requestAnimationFrame(() => requestAnimationFrame(() => done()))
        }),
    )
    await page.screenshot({
      path: resolve(screenshots, name),
      fullPage: true,
      animations: 'disabled',
    })
  } finally {
    await style.evaluate((element) => {
      element.parentNode?.removeChild(element)
    })
  }
}

async function noOverflow(page: Page, context: string) {
  await page.evaluate(() => document.fonts.ready)
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(dimensions.content, `${context}: ${JSON.stringify(dimensions)}`).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  )
}

async function prepareJourney(page: Page) {
  await page.goto('/#/catalog')
  const response = await page.request.get('/api/orders')
  expect(response.ok()).toBeTruthy()
  const payload: CreateOrderInput = {
    requestId: crypto.randomUUID(),
    customer: { name: 'Демо Пользователь', email: 'demo@example.com', phone: '+7 999 000-00-00' },
    delivery: 'pickup',
    address: '',
    items: [{ productId: 2, quantity: 1 }],
  }
  const saved = await page.request.post('/api/orders', { data: payload })
  expect(saved.status()).toBe(201)
  const { order } = (await saved.json()) as OrderResponse
  const card = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: oilFilter, exact: true }) })
  await card.getByRole('button', { name: 'В корзину', exact: true }).click()
  return order.id
}

test('catalogue search, empty reset, price sorting and combined filters', async ({ page }) => {
  await page.goto('/#/catalog')
  const cards = page.locator('main article.card')
  await expect(cards).toHaveCount(8)
  await page.getByLabel('Поиск в каталоге', { exact: true }).fill('W71275')
  await page.getByRole('button', { name: 'Искать', exact: true }).click()
  await expect(cards).toHaveCount(1)
  await expect(page.getByRole('heading', { name: oilFilter, exact: true })).toBeVisible()

  await page.getByLabel('Поиск в каталоге', { exact: true }).fill('not-a-demo-part-xyz')
  await page.getByRole('button', { name: 'Искать', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ничего не найдено', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Сбросить поиск и фильтры', exact: true }).click()
  await expect(cards).toHaveCount(8)

  await page.getByLabel('Сортировка:', { exact: true }).selectOption('price-asc')
  let prices = await cards.locator('.card__price-new').allTextContents()
  let values = prices.map((price) => Number(price.replace(/\D/g, '')))
  expect(values).toEqual([...values].sort((a, b) => a - b))
  await page.getByLabel('Сортировка:', { exact: true }).selectOption('price-desc')
  prices = await cards.locator('.card__price-new').allTextContents()
  values = prices.map((price) => Number(price.replace(/\D/g, '')))
  expect(values).toEqual([...values].sort((a, b) => b - a))

  await page.getByRole('checkbox', { name: /^Bosch/ }).check()
  await expect(cards).toHaveCount(1)
  await page.getByRole('button', { name: 'Сбросить', exact: true }).click()
  await expect(cards).toHaveCount(8)
  await page.getByLabel('Цена от', { exact: true }).fill('1000')
  await page.getByLabel('Цена до', { exact: true }).fill('3000')
  await page.getByRole('checkbox', { name: 'Только в наличии', exact: true }).check()
  await expect(cards).toHaveCount(2)
  await page.getByRole('checkbox', { name: /^Mann-Filter/ }).check()
  await expect(page.getByRole('heading', { name: 'Ничего не найдено', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Сбросить поиск и фильтры', exact: true }).click()
  await expect(cards).toHaveCount(8)
})

test('product quantity is capped at20 and unavailable products cannot be added', async ({
  page,
}) => {
  await page.goto('/#/product/2')
  const quantity = page.getByRole('spinbutton', { name: 'Количество', exact: true })
  await expect(quantity).toHaveValue('1')
  await expect(
    page.getByRole('button', { name: 'Уменьшить количество', exact: true }),
  ).toBeDisabled()
  await quantity.fill('99')
  await expect(quantity).toHaveValue('20')
  await expect(
    page.getByRole('button', { name: 'Увеличить количество', exact: true }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Добавить в корзину', exact: true }).click()
  await page.goto('/#/cart')
  await expect(page.getByRole('spinbutton', { name: 'Количество', exact: true })).toHaveValue('20')
  await page.goto('/#/product/4')
  await expect(page.getByRole('button', { name: 'Недоступно', exact: true }).first()).toBeDisabled()
  await expect(page.getByRole('spinbutton', { name: 'Количество', exact: true })).toBeDisabled()
  await page.goto('/#/cart')
  await expect(page.locator('main article.cart-item')).toHaveCount(1)
})

test('header navigation, accessible route focus and8 unique WebP product images', async ({
  page,
}) => {
  await page.goto('/#/catalog')
  await expect(page.locator('.demo-strip')).toHaveCount(0)
  await imagesLoaded(page)
  const paths = await page
    .locator('main .card__image img')
    .evaluateAll((images) => images.map((image) => image.getAttribute('src') ?? ''))
  expect(paths).toHaveLength(8)
  expect(new Set(paths).size).toBe(8)
  expect(paths.every((path) => path.endsWith('.webp'))).toBeTruthy()

  const burger = page.getByRole('button', { name: 'Открыть меню', exact: true })
  if (await burger.isVisible()) {
    await burger.click()
    await page.keyboard.press('Escape')
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await expect(burger).toBeFocused()
    await burger.click()
    await page
      .getByRole('banner')
      .getByRole('link', { name: /АвтоДеталь/ })
      .first()
      .click()
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await burger.click()
    await page.getByRole('banner').getByRole('link', { name: 'Корзина', exact: true }).click()
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await page.goto('/#/catalog')
    await burger.click()
  }
  const navigation = page.getByRole('navigation', {
    name: 'Основное меню',
    exact: true,
    includeHidden: true,
  })
  await navigation.getByRole('link', { name: 'Тормозная система', exact: true }).click()
  await expect(
    navigation.getByRole('link', {
      name: 'Тормозная система',
      exact: true,
      includeHidden: true,
    }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('main')).toBeFocused()
  await expect(page).toHaveTitle('Тормозная система — АвтоДеталь')
  const before = page.url()
  await page.getByRole('link', { name: 'Перейти к содержимому', exact: true }).focus()
  await page.keyboard.press('Enter')
  expect(page.url()).toBe(before)
  await expect(page.locator('main')).toBeFocused()
  await page.getByLabel('Поиск запчастей', { exact: true }).fill('W71275')
  await page.getByRole('button', { name: 'Найти', exact: true }).click()
  await expect(page.locator('main article.card')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: oilFilter, exact: true })).toBeVisible()
})

test('leaving checkout before a delayed response does not erase a changed cart', async ({
  page,
}) => {
  const orderId = await prepareJourney(page)
  const list = await page.request.get('/api/orders')
  const saved = ((await list.json()) as OrdersResponse).orders.find((order) => order.id === orderId)
  expect(saved).toBeTruthy()
  let release!: () => void
  let submitted!: () => void
  const pendingResponse = new Promise<void>((done) => {
    release = done
  })
  const requestStarted = new Promise<void>((done) => {
    submitted = done
  })
  await page.route('**/api/orders', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }
    submitted()
    await pendingResponse
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ order: saved }),
    })
  })
  try {
    await page.goto('/#/checkout')
    await page.getByRole('button', { name: 'Заполнить тестовыми данными', exact: true }).click()
    await page.getByRole('radio', { name: /Самовывоз/ }).check()
    await page.getByRole('button', { name: 'Создать демо-заказ', exact: true }).click()
    await requestStarted
    await page.goto('/#/catalog')
    const other = page.getByRole('article').filter({
      has: page.getByRole('heading', {
        name: 'Колодки тормозные передние, комплект 4 шт.',
        exact: true,
      }),
    })
    await other.getByRole('button', { name: 'В корзину', exact: true }).click()
    const received = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/orders') && response.request().method() === 'POST',
    )
    release()
    const response = await received
    expect(response.status()).toBe(201)
    await response.finished()
    await page.evaluate(
      () =>
        new Promise<void>((done) =>
          requestAnimationFrame(() => requestAnimationFrame(() => done())),
        ),
    )
    await page.goto('/#/cart')
    await expect(page.locator('main article.cart-item')).toHaveCount(2)
    await expect(page.getByRole('heading', { name: oilFilter, exact: true })).toBeVisible()
    await expect(
      page.getByRole('heading', {
        name: 'Колодки тормозные передние, комплект 4 шт.',
        exact: true,
      }),
    ).toBeVisible()
  } finally {
    release()
  }
})

test('a409 status conflict followed by failed reload does not claim a successful refresh', async ({
  page,
}) => {
  const orderId = await prepareJourney(page)
  await page.goto('/#/orders')
  await expect(page.getByText(orderId, { exact: true })).toBeVisible()
  let conflict = false
  await page.route('**/api/orders', async (route) => {
    if (conflict && route.request().method() === 'GET') {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Тест: обновление недоступно' }),
      })
    } else {
      await route.continue()
    }
  })
  await page.route('**/api/orders/*', async (route) => {
    conflict = true
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Тест: конфликт версии' }),
    })
  })
  await page.getByRole('button', { name: 'Подтвердить', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Тест: обновление недоступно')
  await expect(page.locator('.flow-notice')).not.toBeVisible()
})

test('all routes remain usable at responsive widths and with unavailable fonts', async ({
  page,
  browser,
  baseURL,
}, testInfo) => {
  test.setTimeout(180_000)
  const mobile = testInfo.project.name.includes('mobile')
  const orderId = await prepareJourney(page)
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => consoleErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  for (const width of mobile ? [375, 320] : [1440, 768]) {
    await page.setViewportSize({ width, height: mobile ? 812 : 1000 })
    for (const route of routes) {
      await page.goto(`/#${route.path}`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      if (route.name === 'orders')
        await expect(page.getByText(orderId, { exact: true })).toBeVisible()
      if (route.name === 'cart')
        await expect(page.getByRole('spinbutton', { name: 'Количество', exact: true })).toHaveValue(
          '1',
        )
      if (route.name === 'checkout')
        await expect(
          page.getByRole('button', { name: 'Создать демо-заказ', exact: true }),
        ).toBeVisible()
      await noOverflow(page, `${width}px ${route.path}`)
      await imagesLoaded(page)
      if (width === 1440 || width === 375)
        await screenshot(page, `final-${route.name}-${mobile ? 'mobile' : 'desktop'}.png`)
    }
  }
  expect(consoleErrors).toEqual([])

  if (mobile) {
    for (const width of [375, 320]) {
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: 812 },
        reducedMotion: 'reduce',
        isMobile: true,
        hasTouch: true,
      })
      try {
        const fallbackPage = await context.newPage()
        await fallbackPage.route(/\.(ttf|woff2?)(\?|$)/, (route) => route.abort())
        const savedId = await prepareJourney(fallbackPage)
        for (const route of routes) {
          await fallbackPage.goto(`/#${route.path}`)
          await expect(fallbackPage.getByRole('heading', { level: 1 })).toBeVisible()
          if (route.name === 'orders')
            await expect(fallbackPage.getByText(savedId, { exact: true })).toBeVisible()
          await noOverflow(fallbackPage, `font-blocked ${width}px ${route.path}`)
        }
      } finally {
        await context.close()
      }
    }
  }
})
