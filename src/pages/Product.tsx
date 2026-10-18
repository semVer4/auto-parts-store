import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { formatPrice, getProduct, products } from '../data/products'
import NotFound from './NotFound'
import { safeQuantity } from '../shared/cart'

export default function Product() {
  const { id } = useParams()
  const product = getProduct(Number(id))
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    setQty(1)
    setAdded(false)
    window.clearTimeout(timer.current)
  }, [id])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  if (!product) return <NotFound />

  const related = products
    .filter((item) => item.id !== product.id)
    .sort(
      (a, b) => Number(b.category === product.category) - Number(a.category === product.category),
    )
    .slice(0, 4)
  const handleAdd = () => {
    add(product, qty)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="container atelier-product">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <Link to="/catalog">Каталог</Link>
          </li>
          <li>
            <Link to={`/catalog?category=${encodeURIComponent(product.category)}`}>
              {product.category}
            </Link>
          </li>
          <li>
            <span aria-current="page">{product.title}</span>
          </li>
        </ul>
      </nav>
      <div className="product-page">
        <figure className="product-gallery">
          <div className="product-gallery__label">
            <span>{product.category}</span>
            <span>№ {String(product.id).padStart(2, '0')}</span>
          </div>
          <div className="product-gallery__main">
            <img
              src={product.image}
              alt={product.title}
              width={720}
              height={720}
              loading="eager"
              decoding="async"
            />
          </div>
          <figcaption className="product-gallery__caption">
            <span>Иллюстративное изображение</span>
            <span>Не является точным фото SKU</span>
          </figcaption>
          <div className="product-gallery__thumbs">
            <button
              type="button"
              className="product-gallery__thumb product-gallery__thumb--active"
              aria-label="Фото 1"
              aria-pressed="true"
            >
              <img src={product.image} alt="" width={64} height={64} />
            </button>
            <p>
              Один товар.
              <br />
              Внимание к деталям.
            </p>
          </div>
        </figure>
        <div className="product-info">
          <p className="product-info__brand">
            {product.brand} <span> / {product.category}</span>
          </p>
          <h1 className="product-info__title">{product.title}</h1>
          <div className="product-info__meta">
            <span>
              Артикул: <strong>{product.article}</strong>
            </span>
            <span
              className={`product-availability${product.inStock ? '' : ' product-availability--unavailable'}`}
            >
              <span aria-hidden="true" />
              {product.inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>
          <div className="product-purchase">
            <span className="product-purchase__label">Стоимость за единицу</span>
            <div className="product-info__price-row">
              <span className="product-info__price">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="product-info__price-old">{formatPrice(product.oldPrice)}</span>
              )}
              {product.badge && product.badge.type !== 'hit' && (
                <span className="product-discount">{product.badge.text}</span>
              )}
            </div>
            <label className="product-quantity-label" htmlFor="product-quantity">
              Количество
            </label>
            <div className="product-info__buy">
              <div className="qty">
                <button
                  className="qty__btn"
                  type="button"
                  aria-label="Уменьшить количество"
                  disabled={qty <= 1 || !product.inStock}
                  onClick={() => setQty((value) => Math.max(1, value - 1))}
                >
                  −
                </button>
                <input
                  className="qty__input"
                  id="product-quantity"
                  type="number"
                  min={1}
                  max={20}
                  value={qty}
                  aria-label="Количество"
                  disabled={!product.inStock}
                  onChange={(event) => setQty(safeQuantity(Number(event.target.value)))}
                />
                <button
                  className="qty__btn"
                  type="button"
                  aria-label="Увеличить количество"
                  disabled={qty >= 20 || !product.inStock}
                  onClick={() => setQty((value) => Math.min(20, value + 1))}
                >
                  +
                </button>
              </div>
              <button
                className="btn btn--primary"
                type="button"
                onClick={handleAdd}
                disabled={added || !product.inStock}
              >
                {!product.inStock
                  ? 'Недоступно'
                  : added
                    ? 'Добавлено в корзину ✓'
                    : 'Добавить в корзину'}
                {!added && product.inStock && (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                )}
              </button>
            </div>
            <div className="product-purchase__hint" role="status">
              {added ? (
                <Link to="/cart">
                  Перейти в корзину <span aria-hidden="true">↗</span>
                </Link>
              ) : product.inStock ? (
                'Демо-заказ без оплаты. До 20 единиц одного товара.'
              ) : (
                'Товар недоступен для заказа в демо. Выберите другую деталь.'
              )}
            </div>
          </div>
          <div className="product-info__features">
            <div className="product-specs-heading">
              <h2>В деталях</h2>
              <span>Характеристики</span>
            </div>
            <table className="product-specs">
              <caption className="visually-hidden">Характеристики товара</caption>
              <tbody>
                {product.specs.map((spec) => (
                  <tr key={spec.label}>
                    <th scope="row">{spec.label}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="product-specs-note">
              Демонстрационные характеристики и цены. Перед реальной покупкой нужно отдельно
              проверить применимость и точный артикул.
            </p>
          </div>
        </div>
      </div>
      <section className="product-related" aria-labelledby="related-heading">
        <div className="product-related__heading">
          <div>
            <span className="catalog-kicker">Продолжить выбор</span>
            <h2 className="section__title" id="related-heading">
              Другие детали каталога
            </h2>
          </div>
          <Link to="/catalog">
            Весь каталог <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="products">
          {related.map((item) => (
            <li className="product" key={item.id}>
              <ProductCard product={item} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
