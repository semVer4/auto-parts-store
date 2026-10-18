import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice, type Product } from '../data/products'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleAdd = () => {
    add(product)
    setAdded(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="card">
      <Link className="card__image" to={`/product/${product.id}`} aria-label={product.title}>
        <span className="card__category">{product.category}</span>
        {product.badge && product.badge.type !== 'hit' && (
          <span className="card__badge">{product.badge.text}</span>
        )}
        <img src={product.image} alt={product.title} width={240} height={180} loading="lazy" />
        <span className="card__view" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 18 18 6M6 6h12v12" />
          </svg>
        </span>
      </Link>
      <div className="card__body">
        <div className="card__meta">
          <p className="card__brand">{product.brand}</p>
          <p className="card__art">{product.article}</p>
        </div>
        <h3 className="card__title">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        <p className={`card__stock ${product.inStock ? 'card__stock--in' : 'card__stock--order'}`}>
          <span aria-hidden="true" />
          {product.inStock ? 'В наличии' : 'Нет в наличии'}
        </p>
        <div className="card__footer">
          <p className="card__price">
            <span className="card__price-new">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="card__price-old">{formatPrice(product.oldPrice)}</span>
            )}
          </p>
          <button
            className="btn btn--primary btn--small"
            type="button"
            onClick={handleAdd}
            disabled={added || !product.inStock}
          >
            {!product.inStock ? 'Недоступно' : added ? 'Добавлено ✓' : 'В корзину'}
            {product.inStock && !added && (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        </div>
        <span className="visually-hidden" role="status">
          {added ? `${product.title}: добавлено в корзину` : ''}
        </span>
      </div>
    </article>
  )
}
