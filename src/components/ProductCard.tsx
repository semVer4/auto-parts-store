import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice, type Product } from '../data/products'
import { useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    add(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="card">
      {product.badge && (
        <span className={`card__badge${product.badge.type === 'hit' ? ' card__badge--hit' : ''}`}>
          {product.badge.text}
        </span>
      )}
      <Link className="card__image" to={`/product/${product.id}`} aria-label={product.title}>
        <img src={product.image} alt={product.title} width={240} height={180} loading="lazy" />
      </Link>
      <div className="card__body">
        <p className="card__brand">{product.brand}</p>
        <h3 className="card__title">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        <p className="card__art">Артикул: {product.article}</p>
        <p className={`card__stock ${product.inStock ? 'card__stock--in' : 'card__stock--order'}`}>
          {product.inStock ? 'В наличии' : 'Нет в наличии'}
        </p>
        <div className="card__footer">
          <p className="card__price">
            {product.oldPrice && (
              <span className="card__price-old">{formatPrice(product.oldPrice)}</span>
            )}
            <span className="card__price-new">{formatPrice(product.price)}</span>
          </p>
          <button
            className="btn btn--primary btn--small"
            type="button"
            onClick={handleAdd}
            disabled={added || !product.inStock}
          >
            {!product.inStock ? 'Недоступно' : added ? 'Добавлено ✓' : 'В корзину'}
          </button>
        </div>
      </div>
    </article>
  )
}
