import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categories, products } from '../data/products'

const advantages = [
  {
    title: 'Каталог и фильтры',
    text: 'Поиск по названию, бренду и артикулу; фильтрация по категории и наличию.',
  },
  {
    title: 'Серверный расчёт',
    text: 'API проверяет товары и считает итог вместе с выбранным способом доставки.',
  },
  {
    title: 'Сохранение заказов',
    text: 'Заказы сохраняются на сервере и доступны после перезагрузки в этой демо-сессии.',
  },
  {
    title: 'История статусов',
    text: 'Подтверждение, отправка и отмена с проверкой допустимых переходов и версии заказа.',
  },
]

export default function Home() {
  const hits = products.slice(0, 4)

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <h1 className="hero__title">От выбора детали до&nbsp;сохранённого&nbsp;заказа</h1>
            <p className="hero__text">
              Демо-магазин с настоящим API, серверной проверкой заказа и историей статусов. Пройдите
              весь сценарий с тестовыми данными — без оплаты и реальных поставок.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" to="/catalog">
                Перейти в каталог
              </Link>
              <Link className="btn btn--ghost" to="/project">
                Как устроен проект
              </Link>
            </div>
          </div>
          <ul className="hero__features">
            <li className="hero__feature">
              <strong>{products.length}</strong>
              <span>демо-товаров</span>
            </li>
            <li className="hero__feature">
              <strong>API</strong>
              <span>сохранение на сервере</span>
            </li>
            <li className="hero__feature">
              <strong>4 статуса</strong>
              <span>контроль жизненного цикла</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">Популярные категории</h2>
          <ul className="categories">
            {categories.map((c) => (
              <li className="category" key={c.name}>
                <Link
                  className="category__link"
                  to={`/catalog?category=${encodeURIComponent(c.name)}`}
                >
                  <span className="category__icon" aria-hidden="true">
                    {c.icon}
                  </span>
                  <span className="category__name">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">Товары для демонстрации</h2>
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
          <h2 className="section__title">Что можно проверить</h2>
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
            <h2 className="section__title">Посмотрите на проект изнутри</h2>
            <p>Архитектура, ограничения, тесты и сценарий демонстрации — без скрытых заглушек.</p>
          </div>
          <Link className="btn btn--primary" to="/project">
            Открыть описание проекта
          </Link>
        </div>
      </section>
    </>
  )
}
