import { getStore } from '@netlify/blobs'
import type { OrderRepository, SessionOrders } from './order-repository'

/** Site-wide store survives deployments. Credentials are injected by Netlify. */
export function createBlobsOrderRepository(): OrderRepository {
  // Resolve the store lazily within an active function request/runtime context.
  const store = () => getStore({ name: 'autodetal-demo-orders-v1', consistency: 'strong' })
  return {
    async read(key) {
      const client = store()
      let entry = await client.getWithMetadata(key, { type: 'json', consistency: 'strong' })
      if (!entry) return null
      // SDK 11.1.4's local Blobs emulator omits ETag on GET, but exposes the
      // actual conditional-write ETag in list(). Never invent an ETag or do an
      // unconditional write. Fence the content read with two matching ETags.
      // All keys have the same fixed length: this exact prefix returns at most
      // one entry; it is not an unbounded listing of all visitors' orders.
      if (!entry.etag) {
        for (let attempt = 0; attempt < 3; attempt++) {
          const before = (await client.list({ prefix: key })).blobs.find(
            (blob) => blob.key === key,
          )?.etag
          const current = await client.getWithMetadata(key, { type: 'json', consistency: 'strong' })
          const after = (await client.list({ prefix: key })).blobs.find(
            (blob) => blob.key === key,
          )?.etag
          if (before && before === after && current && (!current.etag || current.etag === before)) {
            entry = { ...current, etag: before }
            break
          }
        }
      }
      if (
        !entry.etag ||
        !entry.data ||
        !Array.isArray(entry.data.orders) ||
        entry.data.orders.length > 20
      )
        throw new Error('Invalid persisted session')
      return { data: entry.data as SessionOrders, etag: entry.etag }
    },
    async write(key, data, etag) {
      const result = await store().setJSON(
        key,
        data,
        etag ? { onlyIfMatch: etag } : { onlyIfNew: true },
      )
      return result.modified
    },
  }
}
