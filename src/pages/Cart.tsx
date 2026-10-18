import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/products'
import { deliveryFees } from '../shared/orders'

export default function Cart() {
  const { lines, total, setQty, remove } = useCart()

  return (
    <div className="container workflow-page flow-editorial cart-editorial">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <span aria-current="page">Корзина</span>
          </li>
        </ul>
      </nav>

      <header className="flow-pagehead">
        <div>
          <span className="workflow-eyebrow">01 / Ваш выбор</span>
          <h1 className="page-head__title">Корзина</h1>
          <p>Проверьте детали. Следующий шаг — оформление заказа.</p>
        </div>
        <span className="flow-pagehead__meta">
          {lines.length} {lines.length === 1 ? 'позиция' : lines.length < 5 ? 'позиции' : 'позиций'}
        </span>
      </header>

      {lines.length === 0 ? (
        <section className="workflow-empty flow-empty" aria-labelledby="empty-cart-title">
          <span className="flow-empty__number" aria-hidden="true">
            01
          </span>
          <div>
            <span className="workflow-eyebrow">Начнём с нужной детали</span>
            <h2 id="empty-cart-title">Корзина пуста</h2>
            <p>Добавьте товары из каталога, чтобы оформить заказ.</p>
            <Link className="btn btn--primary" to="/catalog">
              Перейти в каталог
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15m-6-6 6 6-6 6" />
              </svg>
            </Link>
          </div>
        </section>
      ) : (
        <div className="cart flow-cart-layout">
          <section className="flow-cart-items" aria-label="Товары в корзине">
            <div className="flow-list-label">
              <span>Деталь / количество</span>
              <span>Стоимость</span>
            </div>
            {lines.map(({ product, qty }) => (
              <article className="cart-item" key={product.id}>
                <Link className="cart-item__img" to={`/product/${product.id}`}>
                  <img src={product.image} alt={product.title} width={112} height={112} />
                </Link>
                <div className="cart-item__details">
                  <p className="cart-item__art">
                    {product.brand} / {product.article}
                  </p>
                  <h2 className="cart-item__title">
                    <Link to={`/product/${product.id}`}>{product.title}</Link>
                  </h2>
                  <div className="cart-item__controls">
                    <div className="qty">
                      <button
                        className="qty__btn"
                        type="button"
                        aria-label="Уменьшить количество"
                        disabled={qty <= 1}
                        onClick={() => setQty(product.id, qty - 1)}
                      >
                        −
                      </button>
                      <input
                        className="qty__input"
                        type="number"
                        min={1}
                        max={20}
                        value={qty}
                        aria-label="Количество"
                        onChange={(e) =>
                          setQty(product.id, Math.max(1, Number(e.target.value) || 1))
                        }
                      />
                      <button
                        className="qty__btn"
                        type="button"
                        aria-label="Увеличить количество"
                        disabled={qty >= 20}
                        onClick={() => setQty(product.id, qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="flow-unit-price">{formatPrice(product.price)} / шт.</span>
                  </div>
                </div>
                <div className="cart-item__amount">
                  <span className="cart-item__price">{formatPrice(product.price * qty)}</span>
                  <button
                    className="cart-item__remove"
                    type="button"
                    onClick={() => remove(product.id)}
                  >
                    Удалить
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m7 7 10 10M17 7 7 17" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
            <Link className="workflow-text-link flow-back-link" to="/catalog">
              Продолжить выбор
            </Link>
          </section>

          <aside className="summary flow-summary">
            <span className="workflow-eyebrow">Следующий шаг / 02</span>
            <h2 className="summary__title">Итого</h2>
            <div className="summary__row">
              <span>Товары</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary__row">
              <span>Доставка</span>
              <span>
                От {formatPrice(deliveryFees.pickup)} до {formatPrice(deliveryFees.post)}
              </span>
            </div>
            <div className="summary__row summary__row--total">
              <span>Товары без доставки</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="workflow-caption">
              Способ и точная стоимость доставки выбираются на следующем шаге.
            </p>
            <Link className="btn btn--primary" to="/checkout">
              Оформить заказ
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15m-6-6 6 6-6 6" />
              </svg>
            </Link>
            <p className="flow-summary__footnote">
              Демонстрационный заказ. Реальная оплата не производится.
            </p>
          </aside>
        </div>
      )}
    </div>
  )
}
