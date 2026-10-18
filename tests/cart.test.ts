import { describe, expect, it } from 'vitest'
import { restoreCart, safeQuantity } from '../src/shared/cart'
import { products } from '../src/data/products'
import { orderCatalogue } from '../src/shared/catalog'

describe('cart recovery', () => {
  it.each([null, [], 'bad', { lines: 'bad' }, { lines: [null, {}, { product: null }] }])(
    'ignores malformed storage %j',
    (value) => {
      expect(restoreCart(value)).toEqual([])
    },
  )
  it('restores IDs and quantities, not arbitrary client prices', () => {
    expect(restoreCart({ lines: [{ product: { id: 1, price: 1 }, qty: 2 }] })).toEqual([
      { productId: 1, quantity: 2 },
    ])
  })
  it('merges duplicates, caps quantities, and removes unavailable/unknown products', () => {
    expect(
      restoreCart({
        lines: [
          { product: { id: 1 }, qty: 15 },
          { product: { id: 1 }, qty: 19 },
          { product: { id: 4 }, qty: 1 },
          { product: { id: 999 }, qty: 1 },
          { product: { id: 2 }, qty: -3 },
          { product: { id: 3 }, qty: Infinity },
        ],
      }),
    ).toEqual([{ productId: 1, quantity: 20 }])
  })
  it('clamps invalid quantity updates', () => {
    expect([0, -1, NaN, Infinity].map(safeQuantity)).toEqual([1, 1, 1, 1])
    expect(safeQuantity(100)).toBe(20)
    expect(safeQuantity(2.8)).toBe(2)
  })
  it('shares authoritative price and availability with the server', () => {
    for (const item of products) {
      const source = orderCatalogue.find((product) => product.id === item.id)!
      expect(item.price).toBe(source.price)
      expect(item.inStock).toBe(source.inStock)
    }
  })
})
