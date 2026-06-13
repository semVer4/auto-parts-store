import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/products'

export default function Checkout() {
  const { lines, total, clear } = useCart()
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDone(true)
    clear()
    window.scrollTo(0, 0)
  }

  if (done) {
    return (
      <div className="container">
        <div className="page-head">
          <h1 className="page-head__title">Заказ оформлен</h1>
        </div>
        <div className="notice">
          Спасибо за заказ! Мы отправили подтверждение на вашу почту.
          Менеджер свяжется с вами в течение 15 минут для уточнения деталей.
        </div>
        <Link className="btn btn--primary" to="/">Вернуться на главную</Link>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="container">
        <div className="page-head">
          <h1 className="page-head__title">Оформление заказа</h1>
        </div>
        <div className="empty">
          <p className="empty__title">Корзина пуста</p>
          <p>Добавьте товары, чтобы оформить заказ.</p>
          <p style={{ marginTop: 16 }}>
            <Link className="btn btn--primary" to="/catalog">Перейти в каталог</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/cart">Корзина</Link></li>
          <li><span aria-current="page">Оформление</span></li>
        </ul>
      </nav>

      <div className="page-head">
        <h1 className="page-head__title">Оформление заказа</h1>
      </div>

      <form className="cart" onSubmit={handleSubmit}>
        <div>
          <div className="checkout-block">
            <h2 className="checkout-block__title">Контактные данные</h2>
            <div className="form-grid">
              <div className="field">
                <label className="field__label" htmlFor="name">Имя <span>*</span></label>
                <input className="field__input" id="name" name="name" required />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="phone">Телефон <span>*</span></label>
                <input className="field__input" id="phone" name="phone" type="tel" required />
              </div>
              <div className="field field--full">
                <label className="field__label" htmlFor="email">E-mail <span>*</span></label>
                <input className="field__input" id="email" name="email" type="email" required />
              </div>
            </div>
          </div>

          <div className="checkout-block">
            <h2 className="checkout-block__title">Способ доставки</h2>
            <label className="radio-card">
              <input type="radio" name="delivery" value="courier" defaultChecked />
              <span>
                <span className="radio-card__title">Курьером</span>
                <span className="radio-card__desc"> — по Москве за 1 день, 350 ₽</span>
              </span>
            </label>
            <label className="radio-card">
              <input type="radio" name="delivery" value="pickup" />
              <span>
                <span className="radio-card__title">Самовывоз</span>
                <span className="radio-card__desc"> — из 50 пунктов выдачи, бесплатно</span>
              </span>
            </label>
            <label className="radio-card">
              <input type="radio" name="delivery" value="post" />
              <span>
                <span className="radio-card__title">Транспортная компания</span>
                <span className="radio-card__desc"> — по России за 1–3 дня</span>
              </span>
            </label>

            <div className="form-grid" style={{ marginTop: 12 }}>
              <div className="field field--full">
                <label className="field__label" htmlFor="address">Адрес доставки</label>
                <input className="field__input" id="address" name="address" placeholder="Город, улица, дом, квартира" />
              </div>
            </div>
          </div>

          <div className="checkout-block">
            <h2 className="checkout-block__title">Способ оплаты</h2>
            <label className="radio-card">
              <input type="radio" name="pay" value="card" defaultChecked />
              <span className="radio-card__title">Картой онлайн</span>
            </label>
            <label className="radio-card">
              <input type="radio" name="pay" value="cash" />
              <span className="radio-card__title">Наличными при получении</span>
            </label>
          </div>
        </div>

        <aside className="summary">
          <h2 className="summary__title">Ваш заказ</h2>
          {lines.map(({ product, qty }) => (
            <div className="summary__row" key={product.id}>
              <span>{product.title} × {qty}</span>
              <span>{formatPrice(product.price * qty)}</span>
            </div>
          ))}
          <div className="summary__row summary__row--total">
            <span>К оплате</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button className="btn btn--primary" type="submit">Подтвердить заказ</button>
        </aside>
      </form>
    </div>
  )
}
