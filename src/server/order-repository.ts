import type { Order } from '../shared/orders'

export interface StoredOrder {
  requestId: string
  fingerprint: string
  order: Order
}

// One bounded aggregate per opaque session makes conditional writes atomic:
// duplicate submission and quota checks cannot race across separate keys.
export interface SessionOrders {
  orders: StoredOrder[]
}
export interface SessionSnapshot {
  data: SessionOrders
  etag: string
}
export interface OrderRepository {
  read(sessionKey: string): Promise<SessionSnapshot | null>
  write(sessionKey: string, data: SessionOrders, previousEtag: string | null): Promise<boolean>
}

/** Test double only. Production never silently falls back to process memory. */
export class MemoryOrderRepository implements OrderRepository {
  private entries = new Map<string, SessionSnapshot>()
  private revision = 0

  async read(key: string): Promise<SessionSnapshot | null> {
    const value = this.entries.get(key)
    return value ? structuredClone(value) : null
  }

  async write(key: string, data: SessionOrders, previousEtag: string | null): Promise<boolean> {
    const current = this.entries.get(key)
    if ((current?.etag ?? null) !== previousEtag) return false
    this.entries.set(key, { data: structuredClone(data), etag: String(++this.revision) })
    return true
  }
}
