import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../data/products'
import {
  orderStatuses,
  statusLabels,
  type ApiError,
  type Order,
  type OrderResponse,
  type OrdersResponse,
  type OrderStatus,
} from '../shared/orders'
import { ensureOrderSession } from '../order-session'

const transitions: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: [],
  cancelled: [],
}
const actionLabels: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Подтвердить',
  shipped: 'Отметить отправленным',
  cancelled: 'Отменить',
}
const deliveryLabels = { pickup: 'Самовывоз', courier: 'Курьер', post: 'Транспортная компания' }
const dateLabel = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(date),
  )

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      await ensureOrderSession()
      const response = await fetch('/api/orders', {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      })
      const body = (await response.json()) as OrdersResponse & ApiError
      if (!response.ok || !Array.isArray(body.orders))
        throw new Error(body.error || 'Не удалось загрузить заказы.')
      setOrders(body.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    } catch (failure) {
      setError(
        failure instanceof Error && failure.name !== 'TypeError' && failure.name !== 'AbortError'
          ? failure.message
          : 'Сервер недоступен. Проверьте соединение и повторите загрузку.',
      )
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])

  const update = async (order: Order, status: OrderStatus) => {
    if (updating) return
    setUpdating(order.id)
    setError('')
    setNotice('')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, version: order.version }),
      })
      const body = (await response.json()) as OrderResponse & ApiError
      if (response.status === 409) {
        await load()
        setNotice(
          'Заказ уже изменён в другой вкладке. Список обновлён — проверьте актуальный статус.',
        )
        return
      }
      if (!response.ok || !body.order?.id)
        throw new Error(body.error || 'Изменение статуса не сохранено.')
      setOrders((previous) => previous.map((item) => (item.id === order.id ? body.order : item)))
      setNotice(
        `Заказ ${order.id}: ${statusLabels[body.order.status].toLowerCase()}. Изменение сохранено.`,
      )
    } catch (failure) {
      setError(
        failure instanceof Error && failure.name !== 'TypeError' && failure.name !== 'AbortError'
          ? failure.message
          : 'Не получено подтверждение изменения. Обновите список, чтобы проверить статус на сервере.',
      )
    } finally {
      window.clearTimeout(timeout)
      setUpdating(null)
    }
  }
  const visible = filter === 'all' ? orders : orders.filter((order) => order.status === filter)
  const active = orders.filter((order) => order.status === 'new' || order.status === 'confirmed')

  return (
    <div className="container workflow-page">
      <div className="workflow-heading">
        <div>
          <span className="workflow-eyebrow">Демонстрационная панель</span>
          <h1 className="page-head__title">Заказы</h1>
          <p className="workflow-muted">
            Создание, обработка и история изменений — в одном сценарии.
          </p>
        </div>
        <button
          className="btn btn--secondary btn--small"
          type="button"
          onClick={() => void load()}
          disabled={loading || !!updating}
        >
          {loading ? 'Обновляем…' : 'Обновить список'}
        </button>
      </div>
      <div className="demo-note">
        <strong>Это не настоящая админка магазина.</strong> Здесь видны только демо-заказы текущей
        браузерной сессии. Полноценная авторизация и роли не реализованы. Не вводите реальные
        персональные данные.
      </div>
      <div className="order-stats">
        <div className="order-stat">
          <span>Всего заказов</span>
          <strong>{orders.length}</strong>
          <small>В вашей демо-сессии</small>
        </div>
        <div className="order-stat">
          <span>В обработке</span>
          <strong>{active.length}</strong>
          <small>Новые и подтверждённые</small>
        </div>
        <div className="order-stat">
          <span>Сумма без отменённых</span>
          <strong>
            {formatPrice(
              orders
                .filter((order) => order.status !== 'cancelled')
                .reduce((sum, order) => sum + order.total, 0),
            )}
          </strong>
          <small>Демонстрационные суммы, не выручка</small>
        </div>
      </div>
      <div className="order-toolbar">
        <div className="status-filters" role="group" aria-label="Фильтр по статусу">
          {(['all', ...orderStatuses] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={`status-filter${filter === status ? ' status-filter--active' : ''}`}
              aria-pressed={filter === status}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'Все' : statusLabels[status]}
              <span>
                {status === 'all'
                  ? orders.length
                  : orders.filter((order) => order.status === status).length}
              </span>
            </button>
          ))}
        </div>
        <span className="workflow-caption" role="status">
          {loading ? 'Загружаем данные с сервера…' : `Показано: ${visible.length}`}
        </span>
      </div>
      {error && (
        <div className="workflow-error" role="alert">
          {error}
          <button
            className="workflow-text-link"
            type="button"
            onClick={() => void load()}
            disabled={loading}
          >
            Повторить загрузку
          </button>
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
      {loading && !orders.length ? (
        <div className="order-skeleton" aria-label="Загрузка заказов" role="status">
          <span />
          <span />
          <span />
        </div>
      ) : !visible.length && !error ? (
        <div className="workflow-empty">
          <span className="workflow-empty__icon" aria-hidden="true">
            ▤
          </span>
          <h2>{orders.length ? 'Заказов с таким статусом нет' : 'Пока нет демо-заказов'}</h2>
          <p>
            {orders.length
              ? 'Выберите другой фильтр или создайте новый заказ.'
              : 'Добавьте товар в корзину и оформите заказ. Он появится здесь после сохранения на сервере.'}
          </p>
          <Link className="btn btn--primary" to="/catalog">
            Выбрать запчасти
          </Link>
        </div>
      ) : (
        <div className="order-list" aria-busy={loading}>
          {visible.map((order) => (
            <article className="order-card" key={order.id} data-testid="order-card">
              <header className="order-card__header">
                <div>
                  <span className="workflow-caption">{dateLabel(order.createdAt)}</span>
                  <h2 className="order-card__id">{order.id}</h2>
                </div>
                <span className={`status-badge status-badge--${order.status}`}>
                  {statusLabels[order.status]}
                </span>
              </header>
              <div className="order-card__body">
                <div>
                  <h3>Состав заказа</h3>
                  <ul className="order-lines">
                    {order.items.map((line) => (
                      <li key={line.productId}>
                        <span>
                          {line.title}
                          <small>
                            {line.quantity} шт. × {formatPrice(line.unitPrice)}
                          </small>
                        </span>
                        <strong>{formatPrice(line.lineTotal)}</strong>
                      </li>
                    ))}
                  </ul>
                  <div className="order-card__total">
                    <span>
                      Итого с доставкой <small>Доставка: {formatPrice(order.shipping)}</small>
                    </span>
                    <strong>{formatPrice(order.total)}</strong>
                  </div>
                </div>
                <dl className="order-customer">
                  <div>
                    <dt>Тестовый покупатель</dt>
                    <dd>{order.customer.name}</dd>
                  </div>
                  <div>
                    <dt>Контакты</dt>
                    <dd>
                      {order.customer.email}
                      <br />
                      {order.customer.phone}
                    </dd>
                  </div>
                  <div>
                    <dt>Доставка</dt>
                    <dd>
                      {deliveryLabels[order.delivery]}
                      {order.address && (
                        <>
                          <br />
                          {order.address}
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              <footer className="order-card__footer">
                <ol className="order-timeline" aria-label="История статусов">
                  {order.history.map((entry, index) => (
                    <li key={`${entry.at}-${index}`}>
                      <span>{statusLabels[entry.status]}</span>
                      <time dateTime={entry.at}>{dateLabel(entry.at)}</time>
                    </li>
                  ))}
                </ol>
                <div className="workflow-actions">
                  {transitions[order.status].length ? (
                    transitions[order.status].map((status) => (
                      <button
                        key={status}
                        className={`btn btn--small ${status === 'cancelled' ? 'btn--danger-ghost' : 'btn--primary'}`}
                        type="button"
                        disabled={!!updating || loading}
                        onClick={() => void update(order, status)}
                      >
                        {updating === order.id ? 'Сохраняем…' : actionLabels[status]}
                      </button>
                    ))
                  ) : (
                    <span className="workflow-caption">Обработка завершена</span>
                  )}
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
