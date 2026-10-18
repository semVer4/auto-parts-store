import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

const ALL_BRANDS = [...new Set(products.map((p) => p.brand))]

type SortKey = 'popular' | 'price-asc' | 'price-desc'

export default function Catalog() {
  const [params] = useSearchParams()
  const category = params.get('category') ?? ''
  const query = (params.get('q') ?? '').trim().toLowerCase()

  const [brands, setBrands] = useState<string[]>([])
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [sort, setSort] = useState<SortKey>('popular')

  const toggleBrand = (brand: string) =>
    setBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))

  const result = useMemo(() => {
    let list = products.slice()

    if (category) list = list.filter((p) => p.category === category)
    if (query) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.article.toLowerCase().includes(query),
      )
    }
    if (brands.length) list = list.filter((p) => brands.includes(p.brand))
    if (priceFrom) list = list.filter((p) => p.price >= Number(priceFrom))
    if (priceTo) list = list.filter((p) => p.price <= Number(priceTo))
    if (onlyInStock) list = list.filter((p) => p.inStock)

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)

    return list
  }, [category, query, brands, priceFrom, priceTo, onlyInStock, sort])

  const title = category || (query ? `Поиск: «${params.get('q')}»` : 'Каталог запчастей')

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <Link to="/catalog">Каталог</Link>
          </li>
          {category && (
            <li>
              <span aria-current="page">{category}</span>
            </li>
          )}
        </ul>
      </nav>

      <div className="page-head">
        <h1 className="page-head__title">{title}</h1>
        <p className="page-head__count">Найдено {result.length} товаров</p>
      </div>

      <div className="catalog">
        <aside>
          <form className="filters" onSubmit={(e) => e.preventDefault()}>
            <fieldset className="filters__group">
              <legend className="filters__legend">Производитель</legend>
              {ALL_BRANDS.map((brand) => (
                <label className="filters__option" key={brand}>
                  <input
                    type="checkbox"
                    checked={brands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  {brand}
                </label>
              ))}
            </fieldset>

            <fieldset className="filters__group">
              <legend className="filters__legend">Цена, ₽</legend>
              <div className="filters__price">
                <label className="visually-hidden" htmlFor="price-from">
                  Цена от
                </label>
                <input
                  id="price-from"
                  type="number"
                  placeholder="от"
                  min={0}
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                />
                <label className="visually-hidden" htmlFor="price-to">
                  Цена до
                </label>
                <input
                  id="price-to"
                  type="number"
                  placeholder="до"
                  min={0}
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                />
              </div>
            </fieldset>

            <fieldset className="filters__group">
              <legend className="filters__legend">Наличие</legend>
              <label className="filters__option">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                />
                Только в наличии
              </label>
            </fieldset>
          </form>
        </aside>

        <section aria-label="Список товаров">
          <div className="toolbar">
            <div className="toolbar__sort">
              <label htmlFor="sort">Сортировка:</label>
              <select
                className="toolbar__select"
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="popular">По популярности</option>
                <option value="price-asc">Сначала дешёвые</option>
                <option value="price-desc">Сначала дорогие</option>
              </select>
            </div>
          </div>

          {result.length === 0 ? (
            <div className="empty">
              <p className="empty__title">Ничего не найдено</p>
              <p>Попробуйте изменить параметры фильтра или сбросить поиск.</p>
            </div>
          ) : (
            <ul className="products">
              {result.map((p) => (
                <li className="product" key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
