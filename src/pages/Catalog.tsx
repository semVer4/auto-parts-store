import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const ALL_BRANDS = [...new Set(products.map((product) => product.brand))]
const CATEGORIES = [...new Set(products.map((product) => product.category))]
type SortKey = 'popular' | 'price-asc' | 'price-desc'

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ''
  const query = (params.get('q') ?? '').trim().toLowerCase()
  const [brands, setBrands] = useState<string[]>([])
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sort, setSort] = useState<SortKey>('popular')
  const toggleBrand = (brand: string) =>
    setBrands((previous) =>
      previous.includes(brand) ? previous.filter((item) => item !== brand) : [...previous, brand],
    )
  const hasFilters = !!(brands.length || priceFrom || priceTo || onlyInStock)
  const resetFilters = () => {
    setBrands([])
    setPriceFrom('')
    setPriceTo('')
    setOnlyInStock(false)
  }
  const clearAll = () => {
    resetFilters()
    setParams({})
  }

  const result = useMemo(() => {
    let list = products.slice()
    if (category) list = list.filter((product) => product.category === category)
    if (query)
      list = list.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.article.toLowerCase().includes(query),
      )
    if (brands.length) list = list.filter((product) => brands.includes(product.brand))
    if (priceFrom) list = list.filter((product) => product.price >= Number(priceFrom))
    if (priceTo) list = list.filter((product) => product.price <= Number(priceTo))
    if (onlyInStock) list = list.filter((product) => product.inStock)
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    return list
  }, [category, query, brands, priceFrom, priceTo, onlyInStock, sort])

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = new URLSearchParams(params)
    const value = String(new FormData(event.currentTarget).get('catalog-query') ?? '').trim()
    if (value) next.set('q', value)
    else next.delete('q')
    setParams(next)
  }
  const categoryUrl = (name: string) => {
    const next = new URLSearchParams(params)
    if (name) next.set('category', name)
    else next.delete('category')
    return `/catalog${next.size ? `?${next.toString()}` : ''}`
  }
  const title = category || (query ? `Поиск: «${params.get('q')}»` : 'Каталог запчастей')

  return (
    <div className="container atelier-catalog">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            {category || query ? (
              <Link to="/catalog">Каталог</Link>
            ) : (
              <span aria-current="page">Каталог</span>
            )}
          </li>
          {category && (
            <li>
              <span aria-current="page">{category}</span>
            </li>
          )}
          {query && !category && (
            <li>
              <span aria-current="page">Поиск</span>
            </li>
          )}
        </ul>
      </nav>
      <div className="catalog-heading">
        <div>
          <span className="catalog-kicker">
            Коллекция / {String(products.length).padStart(2, '0')} деталей
          </span>
          <h1 className="page-head__title">{title}</h1>
          <p>Точная деталь — правильное начало.</p>
        </div>
        <div className="catalog-heading__note">
          Подбор деталей
          <br />
          <small>По названию, бренду и артикулу</small>
        </div>
      </div>
      <nav className="catalog-sections" aria-label="Категории каталога">
        <Link
          className={!category ? 'is-selected' : ''}
          to={categoryUrl('')}
          aria-current={!category ? 'page' : undefined}
        >
          Все детали <span>{products.length}</span>
        </Link>
        {CATEGORIES.map((name) => (
          <Link
            key={name}
            className={category === name ? 'is-selected' : ''}
            to={categoryUrl(name)}
            aria-current={category === name ? 'page' : undefined}
          >
            {name}
            <span>{products.filter((product) => product.category === name).length}</span>
          </Link>
        ))}
      </nav>
      <div className="catalog">
        <aside className="catalog-sidebar" aria-label="Фильтры товаров">
          <form className="filters" onSubmit={(event) => event.preventDefault()}>
            <div className="catalog-filter-heading">
              <h2>Уточнить выбор</h2>
              <button type="button" onClick={resetFilters} disabled={!hasFilters}>
                Сбросить
              </button>
            </div>
            <fieldset className="filters__group">
              <legend className="filters__legend">Производитель</legend>
              {ALL_BRANDS.map((brand) => (
                <label className="filters__option" key={brand}>
                  <input
                    type="checkbox"
                    checked={brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <span>{brand}</span>
                  <small>{products.filter((product) => product.brand === brand).length}</small>
                </label>
              ))}
            </fieldset>
            <fieldset className="filters__group">
              <legend className="filters__legend">Цена, ₽</legend>
              <div className="filters__price">
                <label htmlFor="price-from">
                  <span>От</span>
                  <input
                    id="price-from"
                    type="number"
                    placeholder="0"
                    min={0}
                    value={priceFrom}
                    aria-label="Цена от"
                    onChange={(event) => setPriceFrom(event.target.value)}
                  />
                </label>
                <span className="catalog-price-dash" aria-hidden="true">
                  —
                </span>
                <label htmlFor="price-to">
                  <span>До</span>
                  <input
                    id="price-to"
                    type="number"
                    placeholder="Любая"
                    min={0}
                    value={priceTo}
                    aria-label="Цена до"
                    onChange={(event) => setPriceTo(event.target.value)}
                  />
                </label>
              </div>
              {priceFrom && priceTo && Number(priceFrom) > Number(priceTo) && (
                <p className="catalog-price-warning" role="status">
                  Нижняя граница больше верхней. Измените диапазон цены.
                </p>
              )}
            </fieldset>
            <fieldset className="filters__group">
              <legend className="filters__legend">Наличие</legend>
              <label className="filters__option">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(event) => setOnlyInStock(event.target.checked)}
                />
                <span>Только в наличии</span>
              </label>
            </fieldset>
          </form>
          <div className="catalog-sidebar-note">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7l-9-4Z" />
              <path d="m8 12 3 3 5-6" />
            </svg>
            <p>Сверьте артикул и совместимость детали с вашим автомобилем.</p>
          </div>
        </aside>
        <section className="catalog-results" aria-label="Список товаров">
          <form
            className="catalog-search"
            role="search"
            onSubmit={search}
            key={`${query}-${category}`}
          >
            <label className="visually-hidden" htmlFor="catalog-query">
              Поиск в каталоге
            </label>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              id="catalog-query"
              name="catalog-query"
              defaultValue={params.get('q') ?? ''}
              placeholder="Название, бренд или артикул"
            />
            <button type="submit">
              Искать <span aria-hidden="true">→</span>
            </button>
          </form>
          <div className="toolbar">
            <p className="page-head__count" role="status">
              Товаров: {result.length}
            </p>
            <div className="toolbar__sort">
              <label htmlFor="sort">Сортировка:</label>
              <select
                className="toolbar__select"
                id="sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
              >
                <option value="popular">Порядок каталога</option>
                <option value="price-asc">Сначала дешёвые</option>
                <option value="price-desc">Сначала дорогие</option>
              </select>
            </div>
          </div>
          {(hasFilters || query) && (
            <div className="catalog-active-filters" aria-label="Применённые фильтры">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(params)
                    next.delete('q')
                    setParams(next)
                  }}
                >
                  Поиск: {params.get('q')} <span aria-hidden="true">×</span>
                  <span className="visually-hidden">Убрать поиск</span>
                </button>
              )}
              {brands.map((brand) => (
                <button
                  type="button"
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  aria-label={`Убрать производителя ${brand}`}
                >
                  {brand}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
              {(priceFrom || priceTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceFrom('')
                    setPriceTo('')
                  }}
                >
                  Цена: {priceFrom || '0'} — {priceTo || 'любая'} ₽{' '}
                  <span aria-hidden="true">×</span>
                  <span className="visually-hidden">Убрать диапазон цены</span>
                </button>
              )}
              {onlyInStock && (
                <button type="button" onClick={() => setOnlyInStock(false)}>
                  В наличии <span aria-hidden="true">×</span>
                  <span className="visually-hidden">Убрать фильтр наличия</span>
                </button>
              )}
            </div>
          )}
          {!result.length ? (
            <div className="catalog-empty">
              <span className="catalog-empty__number">00</span>
              <h2 className="empty__title">Ничего не найдено</h2>
              <p>Попробуйте другой запрос или расширьте параметры выбора.</p>
              <button className="btn btn--primary" type="button" onClick={clearAll}>
                Сбросить поиск и фильтры
              </button>
            </div>
          ) : (
            <ul className="products">
              {result.map((product) => (
                <li className="product" key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className="catalog-bottom-note">
        <span>Деталь за деталью.</span>
        <p>Уточняйте выбор по бренду, категории и характеристикам.</p>
        <Link to="/cart">
          Перейти в корзину <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  )
}
