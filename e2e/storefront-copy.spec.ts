import { expect, test } from '@playwright/test'

test('home and catalogue use neutral copy, including shared navigation and metadata', async ({
  page,
}) => {
  const internalCopy = /демо|demo|портфолио|тестов|демонстрац/iu
  for (const route of ['/#/', '/#/catalog', '/#/catalog?category=Двигатель']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.locator('body').innerText(), route).not.toMatch(internalCopy)
    const labels = await page
      .locator('[aria-label]')
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('aria-label')).join(' '),
      )
    expect(labels, `${route}: accessible labels`).not.toMatch(internalCopy)
    expect(await page.locator('meta[name="description"]').getAttribute('content')).not.toMatch(
      internalCopy,
    )
    const viewport = await page.evaluate(() => ({
      width: innerWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(viewport.content).toBeLessThanOrEqual(viewport.width + 1)
  }

  await page.goto('/#/catalog')
  const filter = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Фильтр масляный W 712/75', exact: true }),
  })
  await filter.getByRole('button', { name: 'В корзину', exact: true }).click()
  await page.goto('/#/checkout')
  await expect(page.getByText('Только тестовые контакты.', { exact: true })).toBeVisible()
})
