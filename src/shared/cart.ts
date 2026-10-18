import { orderCatalogue } from './catalog'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const safeQuantity = (value: number) =>
  Number.isFinite(value) ? Math.max(1, Math.min(20, Math.trunc(value))) : 1

// Local storage is untrusted input, including values saved by older app versions.
export function restoreCart(value: unknown): { productId: number; quantity: number }[] {
  if (!isRecord(value) || !Array.isArray(value.lines)) return []
  const result = new Map<number, number>()
  for (const line of value.lines.slice(0, 200)) {
    if (!isRecord(line) || !isRecord(line.product) || typeof line.product.id !== 'number') continue
    if (typeof line.qty !== 'number' || !Number.isFinite(line.qty) || line.qty <= 0) continue
    const productId = line.product.id
    const product = orderCatalogue.find((item) => item.id === productId)
    if (!product?.inStock) continue
    result.set(product.id, safeQuantity((result.get(product.id) ?? 0) + line.qty))
  }
  return [...result].map(([productId, quantity]) => ({ productId, quantity }))
}
