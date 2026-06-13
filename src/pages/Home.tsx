import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'

const advantages = [
  { title: 'Гарантия качества', text: 'Работаем напрямую с производителями. На все товары действует гарантия до 24 месяцев.' },
  { title: 'Быстрая доставка', text: 'Доставим заказ по России за 1–3 дня. Самовывоз из 50 пунктов в вашем городе.' },
  { title: 'Точный подбор', text: 'Подберём деталь по VIN-коду или госномеру — без ошибок и переплат.' },
  { title: 'Удобная оплата', text: 'Картой онлайн, наличными при получении или безналичный расчёт для юрлиц.' },
]

export default function Home() {
  const hits = products.slice(0, 4)

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <h1 className="hero__title">Запчасти для вашего авто за&nbsp;один&nbsp;клик</h1>
            <p className="hero__text">
              Более 2 000 000 наименований оригинальных деталей и качественных аналогов.
              Подбор по VIN, доставка по всей России за 1–3 дня.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" to="/catalog">Перейти в каталог</Link>
              <Link className="btn btn--ghost" to="/catalog">Подбор по VIN</Link>
            </div>
          </div>
          <ul className="hero__features">
            <li className="hero__feature"><strong>2 млн+</strong><span>товаров в наличии</span></li>
            <li className="hero__feature"><strong>1–3 дня</strong><span>срок доставки</span></li>
            <li className="hero__feature"><strong>24 мес.</strong><span>гарантия качества</span></li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">Популярные категории</h2>
          <ul className="categories">
            {categories.map((c) => (
              <li className="category" key={c.name}>
                <Link className="category__link" to={`/catalog?category=${encodeURIComponent(c.name)}`}>
                  <span className="category__icon" aria-hidden="true">{c.icon}</span>
                  <span className="category__name">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">Хиты продаж</h2>
          <ul className="products">
            {hits.map((p) => (
              <li className="product" key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <h2 className="section__title">Почему выбирают нас</h2>
          <ul className="advantages">
            {advantages.map((a) => (
              <li className="advantage" key={a.title}>
                <h3 className="advantage__title">{a.title}</h3>
                <p className="advantage__text">{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section subscribe">
        <div className="container subscribe__inner">
          <div className="subscribe__text">
            <h2 className="section__title">Подпишитесь на скидки</h2>
            <p>Получайте подборки акций и спецпредложений на запчасти раз в неделю.</p>
          </div>
          <form className="subscribe__form" onSubmit={(e) => { e.preventDefault(); e.currentTarget.reset() }}>
            <label className="visually-hidden" htmlFor="email">Ваш e-mail</label>
            <input className="subscribe__input" id="email" type="email" name="email" placeholder="Ваш e-mail" required />
            <button className="btn btn--primary" type="submit">Подписаться</button>
          </form>
        </div>
      </section>
    </>
  )
}
