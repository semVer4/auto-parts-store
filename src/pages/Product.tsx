import { useState } from 'react'
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
  const [active, setActive] = useState(0)
  const [added, setAdded] = useState(false)

  if (!product) return <NotFound />

  const gallery = [
    product.image,
    ...products
      .filter((p) => p.id !== product.id)
      .slice(0, 2)
      .map((p) => p.image),
  ]
  const related = products.filter((p) => p.id !== product.id).slice(0, 4)

  const handleAdd = () => {
    add(product, qty)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1500)
  }

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
        <div className="product-gallery">
          <div className="product-gallery__main">
            <img src={gallery[active]} alt={product.title} width={360} height={270} />
          </div>
          <div className="product-gallery__thumbs">
            {gallery.map((src, i) => (
              <button
                key={i}
                type="button"
                className={`product-gallery__thumb${i === active ? ' product-gallery__thumb--active' : ''}`}
                aria-label={`Фото ${i + 1}`}
                onClick={() => setActive(i)}
              >
                <img src={src} alt="" width={64} height={48} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <p className="product-info__brand">{product.brand}</p>
          <h1 className="product-info__title">{product.title}</h1>

          <div className="product-info__meta">
            <span>
              Артикул: <strong>{product.article}</strong>
            </span>
            <span
              className={`card__stock ${product.inStock ? 'card__stock--in' : 'card__stock--order'}`}
            >
              {product.inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>

          <div className="product-info__price-row">
            <span className="product-info__price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="product-info__price-old">{formatPrice(product.oldPrice)}</span>
            )}
            {product.badge && (
              <span className="card__badge" style={{ position: 'static' }}>
                {product.badge.text}
              </span>
            )}
          </div>

          <div className="product-info__buy">
            <div className="qty">
              <button
                className="qty__btn"
                type="button"
                aria-label="Уменьшить количество"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
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
                onChange={(e) => setQty(safeQuantity(Number(e.target.value)))}
              />
              <button
                className="qty__btn"
                type="button"
                aria-label="Увеличить количество"
                disabled={qty >= 20}
                onClick={() => setQty((q) => Math.min(20, q + 1))}
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
            </button>
          </div>

          <div className="product-info__features">
            <table className="product-specs">
              <caption className="visually-hidden">Характеристики товара</caption>
              <tbody>
                {product.specs.map((s) => (
                  <tr key={s.label}>
                    <th scope="row">{s.label}</th>
                    <td>{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section__title">С этим товаром покупают</h2>
        <ul className="products">
          {related.map((p) => (
            <li className="product" key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
