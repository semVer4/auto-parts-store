import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/products'

const DELIVERY_THRESHOLD = 5000
const DELIVERY_COST = 350

export default function Cart() {
  const { lines, total, setQty, remove } = useCart()

  if (lines.length === 0) {
    return (
      <div className="container">
        <div className="page-head">
          <h1 className="page-head__title">Корзина</h1>
        </div>
        <div className="empty">
          <p className="empty__title">Корзина пуста</p>
          <p>Добавьте товары из каталога, чтобы оформить заказ.</p>
          <p style={{ marginTop: 16 }}>
            <Link className="btn btn--primary" to="/catalog">Перейти в каталог</Link>
          </p>
        </div>
      </div>
    )
  }

  const delivery = total >= DELIVERY_THRESHOLD ? 0 : DELIVERY_COST

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li><Link to="/">Главная</Link></li>
          <li><span aria-current="page">Корзина</span></li>
        </ul>
      </nav>

      <div className="page-head">
        <h1 className="page-head__title">Корзина</h1>
        <p className="page-head__count">{lines.length} товара(ов)</p>
      </div>

      <div className="cart">
        <section aria-label="Товары в корзине">
          {lines.map(({ product, qty }) => (
            <article className="cart-item" key={product.id}>
              <Link className="cart-item__img" to={`/product/${product.id}`}>
                <img src={product.image} alt={product.title} width={80} height={60} />
              </Link>
              <div>
                <h2 className="cart-item__title">
                  <Link to={`/product/${product.id}`}>{product.title}</Link>
                </h2>
                <p className="cart-item__art">{product.brand} · Артикул: {product.article}</p>
                <div className="cart-item__controls">
                  <div className="qty">
                    <button className="qty__btn" type="button" aria-label="Уменьшить количество"
                      onClick={() => setQty(product.id, qty - 1)}>−</button>
                    <input className="qty__input" type="number" min={1} max={99} value={qty}
                      aria-label="Количество"
                      onChange={(e) => setQty(product.id, Math.max(1, Number(e.target.value) || 1))} />
                    <button className="qty__btn" type="button" aria-label="Увеличить количество"
                      onClick={() => setQty(product.id, qty + 1)}>+</button>
                  </div>
                  <span className="cart-item__price">{formatPrice(product.price * qty)}</span>
                  <button className="cart-item__remove" type="button" onClick={() => remove(product.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="summary">
          <h2 className="summary__title">Итого</h2>
          <div className="summary__row">
            <span>Товары</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="summary__row">
            <span>Доставка</span>
            <span>{delivery === 0 ? 'Бесплатно' : formatPrice(delivery)}</span>
          </div>
          <div className="summary__row summary__row--total">
            <span>К оплате</span>
            <span>{formatPrice(total + delivery)}</span>
          </div>
          <Link className="btn btn--primary" to="/checkout">Оформить заказ</Link>
        </aside>
      </div>
    </div>
  )
}
