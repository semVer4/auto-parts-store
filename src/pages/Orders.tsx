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
      return true
    } catch (failure) {
      setError(
        failure instanceof Error && failure.name !== 'TypeError' && failure.name !== 'AbortError'
          ? failure.message
          : 'Сервер недоступен. Проверьте соединение и повторите загрузку.',
      )
      return false
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
        if (await load()) {
          setNotice(
            'Заказ уже изменён в другой вкладке. Список обновлён — проверьте актуальный статус.',
          )
        }
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
    <div className="container workflow-page flow-editorial orders-editorial">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <span aria-current="page">Заказы</span>
          </li>
        </ul>
      </nav>
      <header className="workflow-heading flow-pagehead">
        <div>
          <span className="workflow-eyebrow">03 / После оформления</span>
          <h1 className="page-head__title">Заказы</h1>
          <p className="workflow-muted">
            Состав, статусы и история. Всё, что происходит с заказом.
          </p>
        </div>
        <button
          className="btn btn--secondary btn--small"
          type="button"
          onClick={() => void load()}
          disabled={loading || !!updating}
        >
          <svg
            className={loading ? 'flow-refresh is-loading' : 'flow-refresh'}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20 7v5h-5M4 17v-5h5" />
            <path d="M5.2 8a7.5 7.5 0 0 1 12.3-3L20 8M4 16l2.5 3A7.5 7.5 0 0 0 18.8 16" />
          </svg>
          {loading ? 'Обновляем…' : 'Обновить список'}
        </button>
      </header>
      <div className="order-stats">
        <div className="order-stat">
          <span>Всего заказов</span>
          <strong>{orders.length}</strong>
          <small>Доступны в этом браузере</small>
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
          <small>Общая стоимость с доставкой</small>
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
        <div className="notice flow-notice" role="status">
          {notice}
        </div>
      )}
      {loading && !orders.length ? (
        <div className="order-skeleton" aria-label="Загрузка заказов" role="status">
          <p className="flow-loading-caption">Получаем данные с сервера</p>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
      ) : !visible.length && !error ? (
        <section className="workflow-empty flow-empty" aria-labelledby="empty-orders-title">
          <span className="flow-empty__number" aria-hidden="true">
            03
          </span>
          <div>
            <span className="workflow-eyebrow">История начинается с выбора</span>
            <h2 id="empty-orders-title">
              {orders.length ? 'Заказов с таким статусом нет' : 'Пока нет заказов'}
            </h2>
            <p>
              {orders.length
                ? 'Выберите другой фильтр или создайте новый заказ.'
                : 'Добавьте товар в корзину и оформите заказ. Состав, статус и история появятся здесь.'}
            </p>
            <Link className="btn btn--primary" to="/catalog">
              Выбрать запчасти
            </Link>
          </div>
        </section>
      ) : (
        <div className="order-list" aria-busy={loading}>
          {visible.map((order) => (
            <article className="order-card" key={order.id} data-testid="order-card">
              <header className="order-card__header">
                <div>
                  <span className="workflow-caption">{dateLabel(order.createdAt)}</span>
                  <span className="flow-order-label">Номер заказа</span>
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
                    <dt>Покупатель</dt>
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
