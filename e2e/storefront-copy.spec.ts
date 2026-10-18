import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import type { OrderResponse } from '../src/shared/orders'

const internalCopy =
  /демо|demo|портфолио|portfolio|тестов|\btest\b|демонстрац|сесси|session|админ|admin/iu
const oilFilter = 'Фильтр масляный W 712/75'
const warning = 'Оплата и доставка через сайт не выполняются.'

async function assertNeutral(page: Page, state: string) {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(await page.locator('body').innerText(), `${state}: visible copy`).not.toMatch(internalCopy)
  const accessibleCopy = await page
    .locator('[aria-label], [title], [alt], [placeholder], input, textarea')
    .evaluateAll((elements) =>
      elements
        .map((element) =>
          [
            ...['aria-label', 'title', 'alt', 'placeholder'].map((name) =>
              element.getAttribute(name),
            ),
            element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
              ? element.value
              : '',
          ].join(' '),
        )
        .join(' '),
    )
  expect(accessibleCopy, `${state}: accessible copy and field values`).not.toMatch(internalCopy)
  expect(await page.title(), `${state}: title`).not.toMatch(internalCopy)
  expect(
    await page.locator('meta[name="description"]').getAttribute('content'),
    `${state}: description`,
  ).not.toMatch(internalCopy)
  await page.evaluate(() => document.fonts.ready)
  const viewport = await page.evaluate(() => ({
    width: innerWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(viewport.content, `${state}: no horizontal overflow`).toBeLessThanOrEqual(
    viewport.width + 1,
  )
}

async function captureState(page: Page, state: string, platform: string) {
  const directory = resolve('output/design-preview')
  await mkdir(directory, { recursive: true })
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
      path: resolve(directory, `final-copy-${state}-${platform}.png`),
      fullPage: true,
      animations: 'disabled',
    })
  } finally {
    await style.evaluate((element) => {
      element.parentNode?.removeChild(element)
    })
  }
}

test('all public pages and order states use neutral copy without hiding checkout limitations', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000)
  const mobile = testInfo.project.name.includes('mobile')
  const platform = mobile ? 'mobile' : 'desktop'
  await page.setViewportSize({ width: mobile ? 375 : 1440, height: mobile ? 812 : 1000 })

  for (const route of [
    '/#/',
    '/#/catalog',
    '/#/catalog?category=Двигатель',
    '/#/product/2',
    '/#/product/4',
    '/#/product/9999',
    '/#/project',
    '/#/contacts',
    '/#/missing-page',
  ]) {
    await page.goto(route)
    await assertNeutral(page, route)
    if (route === '/#/contacts') {
      const summaries = page.locator('main details > summary')
      for (let index = 0; index < (await summaries.count()); index++)
        await summaries.nth(index).click()
      await assertNeutral(page, `${route}: expanded questions`)
    }
  }

  for (const [route, heading, screenshot] of [
    ['/cart', 'Корзина пуста', 'cart-empty'],
    ['/checkout', 'Сначала добавим запчасти', 'checkout-empty'],
    ['/orders', 'Пока нет заказов', 'orders-empty'],
  ]) {
    await page.goto(`/#${route}`)
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    await assertNeutral(page, `${route}: empty`)
    await captureState(page, screenshot, platform)
  }

  await page.goto('/#/catalog')
  const filter = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: oilFilter, exact: true }),
  })
  await filter.getByRole('button', { name: 'В корзину', exact: true }).click()
  await page.goto('/#/cart')
  await expect(page.locator('main article.cart-item')).toHaveCount(1)
  await assertNeutral(page, 'cart: populated')

  await page.getByRole('link', { name: 'Оформить заказ', exact: true }).click()
  await expect(page.getByText(warning, { exact: true })).toBeVisible()
  await expect(page.locator('.flow-demo-note')).toContainText('вымышленные контакты')
  await page.getByRole('button', { name: 'Заполнить пример', exact: true }).click()
  await expect(page.getByLabel(/^Имя/)).toHaveValue('Покупатель Пример')
  await expect(page.getByLabel(/^E-mail/)).toHaveValue('buyer@example.com')
  await page.getByRole('radio', { name: /Самовывоз/ }).check()
  await assertNeutral(page, 'checkout: populated')

  const created = page.waitForResponse(
    (response) => response.url().endsWith('/api/orders') && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click()
  const response = await created
  expect(response.status()).toBe(201)
  const { order } = (await response.json()) as OrderResponse
  expect(order.total).toBe(480)
  await expect(page.getByRole('heading', { name: 'Заказ оформлен', exact: true })).toBeVisible()
  await expect(page.getByTestId('order-receipt')).toBeVisible()
  await expect(page.getByTestId('order-id')).toHaveText(order.id)
  await assertNeutral(page, 'checkout: saved receipt')
  await captureState(page, 'receipt', platform)

  await page.goto('/#/cart')
  await expect(page.getByRole('heading', { name: 'Корзина пуста', exact: true })).toBeVisible()
  await page.goto('/#/orders')
  await expect(page.getByTestId('order-card')).toHaveCount(1)
  await expect(page.getByText(order.id, { exact: true })).toBeVisible()
  await expect(page.getByText('buyer@example.com', { exact: false })).toBeVisible()
  await assertNeutral(page, 'orders: populated')
  await page.reload()
  await expect(page.getByText(order.id, { exact: true })).toBeVisible()
  await assertNeutral(page, 'orders: persisted after reload')
  await page.getByRole('button', { name: 'Подтвердить', exact: true }).click()
  await expect(page.getByText('Подтверждён', { exact: true }).first()).toBeVisible()
  await assertNeutral(page, 'orders: updated status and notice')
  await page.getByRole('button', { name: /^Отменён/ }).click()
  await expect(
    page.getByRole('heading', { name: 'Заказов с таким статусом нет', exact: true }),
  ).toBeVisible()
  await assertNeutral(page, 'orders: empty status filter')
})
