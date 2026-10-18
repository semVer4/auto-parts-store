import { type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {diagonal ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}
    </svg>
  )
}

function itemCount(count: number) {
  return `${count} ${count === 1 ? 'товар' : count < 5 ? 'товара' : 'товаров'}`
}

export default function Home() {
  const navigate = useNavigate()
  const selection = [2, 1, 3, 5]
    .map((id) => products.find((product) => product.id === id)!)
    .filter(Boolean)
  const categories = [...new Set(products.map((product) => product.category))]

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    navigate(`/catalog${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <div className="editorial-home">
      <section className="editorial-hero container" aria-labelledby="home-title">
        <div className="editorial-hero__masthead">
          <span>Автодеталь / Незаменимые детали</span>
          <span className="editorial-hero__edition">Каталог № 01</span>
        </div>
        <div className="editorial-hero__layout">
          <div className="editorial-hero__copy">
            <p className="editorial-kicker">
              <span /> Сделано для движения
            </p>
            <h1 id="home-title" className="editorial-hero__title">
              <span>Движение</span> <span>начинается</span>{' '}
              <span className="editorial-hero__accent">с деталей.</span>
            </h1>
            <p className="editorial-hero__intro">
              Большие маршруты начинаются с малого.
              <br className="editorial-desktop-break" /> Найдите нужную деталь по названию или
              артикулу.
            </p>
            <form className="editorial-search" role="search" onSubmit={handleSearch}>
              <label className="visually-hidden" htmlFor="home-part-search">
                Поиск детали по названию или артикулу
              </label>
              <svg
                className="editorial-search__icon"
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
              <input
                id="home-part-search"
                name="q"
                type="search"
                placeholder="Название или артикул"
                autoComplete="off"
              />
              <button type="submit">
                <span>Найти деталь</span>
                <Arrow />
              </button>
            </form>
            <div className="editorial-search-hints">
              <span>Например:</span>
              <Link to="/catalog?q=W71275">W71275</Link>
              <Link to="/catalog?q=5W-40">Масло 5W-40</Link>
            </div>
          </div>
          <figure className="editorial-hero__visual">
            <div className="editorial-hero__image">
              <img
                src="/img/editorial-car-hero.webp"
                alt="Красный спортивный автомобиль в светлом индустриальном интерьере"
                width="1536"
                height="1024"
                loading="eager"
                decoding="async"
              />
            </div>
            <figcaption>
              <span>Форма следует функции.</span>
              <span>
                Точность — в деталях <Arrow diagonal />
              </span>
            </figcaption>
          </figure>
        </div>
        <div className="editorial-hero__footnote">
          <span>Каталог. Корзина. Сохранённый заказ.</span>
          <p>Поиск по названию и артикулу</p>
        </div>
      </section>

      <section className="editorial-categories container" aria-labelledby="home-categories-title">
        <div className="editorial-section-label">
          <span className="editorial-kicker">01 / Навигация</span>
          <h2 id="home-categories-title">
            Нужная система. <br />
            Нужная деталь.
          </h2>
          <p>
            {products.length} товаров в {categories.length} разделах
          </p>
        </div>
        <ul className="editorial-category-list">
          {categories.map((category, index) => (
            <li key={category}>
              <Link
                className="editorial-category"
                to={`/catalog?category=${encodeURIComponent(category)}`}
              >
                <span className="editorial-category__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="editorial-category__name">{category}</span>
                <span className="editorial-category__count">
                  {itemCount(products.filter((product) => product.category === category).length)}
                </span>
                <Arrow diagonal />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="editorial-selection" aria-labelledby="home-selection-title">
        <div className="container">
          <div className="editorial-section-heading">
            <div>
              <span className="editorial-kicker">02 / Детали каталога</span>
              <h2 id="home-selection-title">
                Для следующего <br />
                <span>километра.</span>
              </h2>
            </div>
            <div className="editorial-section-heading__aside">
              <p>
                От регулярного обслуживания <br />
                до внимания к каждой мелочи.
              </p>
              <Link className="editorial-link" to="/catalog">
                Весь каталог <Arrow />
              </Link>
            </div>
          </div>
          <ul className="editorial-products">
            {selection.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
          <p className="editorial-selection__note">
            Сверьте артикул и совместимость детали с вашим автомобилем.
          </p>
        </div>
      </section>

      <section className="editorial-route container" aria-labelledby="home-route-title">
        <div className="editorial-route__intro">
          <span className="editorial-kicker">03 / От выбора к результату</span>
          <h2 id="home-route-title">
            Простой путь. <br />
            Всё по порядку.
          </h2>
          <p>Найдите деталь, укажите количество и соберите заказ в корзине.</p>
          <Link className="editorial-link" to="/catalog">
            Перейти в каталог <Arrow />
          </Link>
        </div>
        <ol className="editorial-route__steps">
          <li>
            <span>01</span>
            <div>
              <h3>Выберите деталь</h3>
              <p>По названию, артикулу или категории.</p>
            </div>
            <Arrow />
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Соберите заказ</h3>
              <p>Укажите количество и проверьте состав корзины.</p>
            </div>
            <Arrow />
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Следите за статусом</h3>
              <p>История и изменения заказа — в разделе «Заказы».</p>
            </div>
            <Link to="/orders" aria-label="Перейти к заказам">
              <Arrow diagonal />
            </Link>
          </li>
        </ol>
      </section>
      <div className="editorial-endnote container">
        <span>Автодеталь.</span>
        <p>
          Детали для обслуживания и ремонта. <br />
          Поиск по названию, бренду и артикулу.
        </p>
        <Link to="/catalog">
          Открыть каталог <Arrow diagonal />
        </Link>
      </div>
    </div>
  )
}
