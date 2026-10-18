export const deliveryFees = { pickup: 0, courier: 350, post: 450 } as const
export type DeliveryMethod = keyof typeof deliveryFees
export const orderStatuses = ['new', 'confirmed', 'shipped', 'cancelled'] as const
export type OrderStatus = (typeof orderStatuses)[number]
export const statusLabels: Record<OrderStatus, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  shipped: 'Отправлен',
  cancelled: 'Отменён',
}
export interface CreateOrderInput {
  requestId: string
  customer: { name: string; email: string; phone: string }
  delivery: DeliveryMethod
  address: string
  items: { productId: number; quantity: number }[]
}
export interface OrderLine {
  productId: number
  title: string
  unitPrice: number
  quantity: number
  lineTotal: number
}
export interface Order {
  id: string
  customer: CreateOrderInput['customer']
  delivery: DeliveryMethod
  address: string
  items: OrderLine[]
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  version: number
  createdAt: string
  updatedAt: string
  history: { status: OrderStatus; at: string }[]
}
export interface ApiError {
  error: string
  fields?: Record<string, string>
}
export interface OrderResponse {
  order: Order
  replayed?: boolean
}
export interface OrdersResponse {
  orders: Order[]
}
