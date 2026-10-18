import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/products'
import {
  deliveryFees,
  statusLabels,
  type ApiError,
  type CreateOrderInput,
  type DeliveryMethod,
  type Order,
  type OrderResponse,
} from '../shared/orders'
import { ensureOrderSession } from '../order-session'

const deliveryLabels: Record<DeliveryMethod, string> = {
  pickup: 'Самовывоз',
  courier: 'Курьер',
  post: 'Транспортная компания',
}

export default function Checkout() {
  const { lines, total, clear } = useCart()
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [delivery, setDelivery] = useState<DeliveryMethod>('courier')
  const [address, setAddress] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [order, setOrder] = useState<Order | null>(null)
  const request = useRef<{ fingerprint: string; requestId: string } | null>(null)
  const submitting = useRef(false)
  const errorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void ensureOrderSession().catch(() => undefined)
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setPending(true)
    setError('')
    setFields({})
    const payload = {
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      delivery,
      address: delivery === 'pickup' ? '' : address.trim(),
      items: lines.map(({ product, qty }) => ({ productId: product.id, quantity: qty })),
    }
    const fingerprint = JSON.stringify(payload)
    if (request.current?.fingerprint !== fingerprint)
      request.current = { fingerprint, requestId: crypto.randomUUID() }
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      await ensureOrderSession()
      const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'same-origin',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          requestId: request.current.requestId,
        } satisfies CreateOrderInput),
      })
      const body = (await response.json()) as OrderResponse & ApiError
      if (!response.ok) {
        setFields(body.fields ?? {})
        throw new Error(body.error || 'Сервер не смог сохранить заказ. Попробуйте ещё раз.')
      }
      if (!body.order?.id)
        throw new Error(
          'Сервер вернул неожиданный ответ. Повторите отправку или проверьте раздел «Заказы».',
        )
      setOrder(body.order)
      clear()
      window.scrollTo(0, 0)
    } catch (failure) {
      setError(
        failure instanceof Error && failure.name !== 'AbortError' && failure.name !== 'TypeError'
          ? failure.message
          : 'Не удалось получить подтверждение от сервера. Корзина сохранена. Проверьте соединение и повторите отправку: неизменённый заказ не будет создан дважды.',
      )
      window.setTimeout(() => errorRef.current?.focus(), 0)
    } finally {
      window.clearTimeout(timeout)
      submitting.current = false
      setPending(false)
    }
  }

  const fillDemo = () => {
    setCustomer({
      name: 'Тестовый покупатель',
      phone: '+7 999 000-00-00',
      email: 'demo@example.com',
    })
    setAddress('Тестовый город, Примерная улица, дом 1')
    setFields({})
  }
  const fieldError = (key: string) => fields[key] || fields[`customer.${key}`]

  if (order)
    return (
      <div className="container workflow-page">
        <div className="receipt" role="status" data-testid="order-receipt">
          <span className="workflow-eyebrow">Сквозной сценарий завершён</span>
          <div className="receipt__check" aria-hidden="true">
            ✓
          </div>
          <h1>Демо-заказ сохранён</h1>
          <p>Сервер принял заказ. Он останется в разделе «Заказы» после обновления страницы.</p>
          <dl className="receipt__details">
            <div>
              <dt>Номер заказа</dt>
              <dd data-testid="order-id">{order.id}</dd>
            </div>
            <div>
              <dt>Сумма с доставкой</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd>
                <span className={`status-badge status-badge--${order.status}`}>
                  {statusLabels[order.status]}
                </span>
              </dd>
            </div>
          </dl>
          <p className="workflow-muted">
            Оплата не списывалась. Письма и реальные отправления не создаются.
          </p>
          <div className="workflow-actions">
            <Link className="btn btn--primary" to="/orders">
              Посмотреть заказ
            </Link>
            <Link className="btn btn--secondary" to="/catalog">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </div>
    )

  if (!lines.length)
    return (
      <div className="container workflow-page">
        <div className="page-head">
          <h1 className="page-head__title">Оформление заказа</h1>
        </div>
        <div className="workflow-empty">
          <span className="workflow-empty__icon" aria-hidden="true">
            ＋
          </span>
          <h2>Сначала добавим запчасти</h2>
          <p>Выберите любой товар в каталоге, чтобы проверить оформление демо-заказа.</p>
          <Link className="btn btn--primary" to="/catalog">
            Перейти в каталог
          </Link>
        </div>
      </div>
    )

  return (
    <div className="container workflow-page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <Link to="/cart">Корзина</Link>
          </li>
          <li>
            <span aria-current="page">Оформление</span>
          </li>
        </ul>
      </nav>
      <div className="workflow-heading">
        <div>
          <span className="workflow-eyebrow">Последний шаг</span>
          <h1 className="page-head__title">Оформление заказа</h1>
          <p className="workflow-muted">Демо-сценарий с настоящим сохранением на сервере.</p>
        </div>
        <Link className="workflow-text-link" to="/cart">
          ← Изменить корзину
        </Link>
      </div>
      <div className="demo-note">
        <strong>Пожалуйста, используйте тестовые данные.</strong> Это портфолио, не настоящий
        магазин. Заказ не требует оплаты и никуда не отправляется.
      </div>
      <form className="cart checkout-form" onSubmit={handleSubmit} aria-busy={pending}>
        <div>
          <fieldset className="checkout-block workflow-fieldset" disabled={pending}>
            <legend className="visually-hidden">Контактные данные</legend>
            <div className="checkout-block__heading">
              <h2 className="checkout-block__title">
                <span className="step-number">1</span> Контактные данные
              </h2>
              <button className="workflow-text-link" type="button" onClick={fillDemo}>
                Заполнить тестовыми данными
              </button>
            </div>
            <div className="form-grid">
              <div className="field">
                <label className="field__label" htmlFor="name">
                  Имя <span>*</span>
                </label>
                <input
                  className="field__input"
                  id="name"
                  name="name"
                  autoComplete="off"
                  required
                  minLength={2}
                  maxLength={80}
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  aria-invalid={!!fieldError('name')}
                  aria-describedby={fieldError('name') ? 'name-error' : undefined}
                />
                {fieldError('name') && (
                  <span className="field-error" id="name-error">
                    {fieldError('name')}
                  </span>
                )}
              </div>
              <div className="field">
                <label className="field__label" htmlFor="phone">
                  Телефон <span>*</span>
                </label>
                <input
                  className="field__input"
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="off"
                  required
                  minLength={7}
                  maxLength={30}
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  aria-invalid={!!fieldError('phone')}
                  aria-describedby={fieldError('phone') ? 'phone-error' : undefined}
                />
                {fieldError('phone') && (
                  <span className="field-error" id="phone-error">
                    {fieldError('phone')}
                  </span>
                )}
              </div>
              <div className="field field--full">
                <label className="field__label" htmlFor="email">
                  E-mail <span>*</span>
                </label>
                <input
                  className="field__input"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  required
                  maxLength={254}
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  aria-invalid={!!fieldError('email')}
                  aria-describedby={fieldError('email') ? 'email-error' : undefined}
                />
                {fieldError('email') && (
                  <span className="field-error" id="email-error">
                    {fieldError('email')}
                  </span>
                )}
              </div>
            </div>
          </fieldset>
          <fieldset className="checkout-block workflow-fieldset" disabled={pending}>
            <legend className="visually-hidden">Способ доставки</legend>
            <h2 className="checkout-block__title">
              <span className="step-number">2</span> Способ доставки
            </h2>
            {(Object.keys(deliveryFees) as DeliveryMethod[]).map((method) => (
              <label
                className={`radio-card${delivery === method ? ' radio-card--selected' : ''}`}
                key={method}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={method}
                  checked={delivery === method}
                  onChange={() => setDelivery(method)}
                />
                <span className="delivery-option">
                  <span className="radio-card__title">{deliveryLabels[method]}</span>
                  <span className="radio-card__desc">Условная доставка для проверки расчёта</span>
                </span>
                <strong>
                  {deliveryFees[method] ? formatPrice(deliveryFees[method]) : 'Бесплатно'}
                </strong>
              </label>
            ))}
            {delivery !== 'pickup' && (
              <div className="field">
                <label className="field__label" htmlFor="address">
                  Тестовый адрес доставки <span>*</span>
                </label>
                <input
                  className="field__input"
                  id="address"
                  name="address"
                  required
                  minLength={5}
                  maxLength={300}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Город, улица, дом"
                  aria-invalid={!!fields.address}
                  aria-describedby={fields.address ? 'address-error' : undefined}
                />
                {fields.address && (
                  <span className="field-error" id="address-error">
                    {fields.address}
                  </span>
                )}
              </div>
            )}
          </fieldset>
          <div className="workflow-security">
            <span aria-hidden="true">◇</span>
            <p>
              <strong>Без онлайн-оплаты</strong>
              <br />В демо проверяется создание и обработка заказа. Банковские данные не
              запрашиваются.
            </p>
          </div>
        </div>
        <aside className="summary workflow-summary">
          <span className="workflow-eyebrow">Проверка перед отправкой</span>
          <h2 className="summary__title">Ваш заказ</h2>
          {lines.map(({ product, qty }) => (
            <div className="summary__row" key={product.id}>
              <span>
                {product.title}
                <small className="workflow-line-quantity">
                  {qty} шт. × {formatPrice(product.price)}
                </small>
              </span>
              <strong>{formatPrice(product.price * qty)}</strong>
            </div>
          ))}
          <div className="summary__row">
            <span>Товары</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="summary__row">
            <span>Доставка</span>
            <span data-testid="shipping-price">
              {deliveryFees[delivery] ? formatPrice(deliveryFees[delivery]) : 'Бесплатно'}
            </span>
          </div>
          <div className="summary__row summary__row--total">
            <span>Итого</span>
            <span data-testid="checkout-total">{formatPrice(total + deliveryFees[delivery])}</span>
          </div>
          {error && (
            <div className="workflow-error" role="alert" tabIndex={-1} ref={errorRef}>
              {error}
            </div>
          )}
          <button className="btn btn--primary" type="submit" disabled={pending}>
            {pending ? 'Сохраняем заказ…' : error ? 'Повторить отправку' : 'Создать демо-заказ'}
          </button>
          <p className="workflow-caption" role="status">
            {pending
              ? 'Пожалуйста, дождитесь ответа сервера.'
              : 'Сумму проверяет сервер. Корзина очищается только после успешного сохранения.'}
          </p>
        </aside>
      </form>
    </div>
  )
}
