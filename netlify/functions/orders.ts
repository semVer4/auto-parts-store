import { createBlobsOrderRepository } from '../../src/server/blobs-order-repository'
import { createOrdersHandler } from '../../src/server/orders-handler'

export default createOrdersHandler(createBlobsOrderRepository(), {
  onStorageError: () => console.error('Orders storage operation failed'),
})

// This custom route is registered ahead of the SPA fallback.
export const config = { path: ['/api/orders', '/api/*'], preferStatic: false }
