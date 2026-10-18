import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Brand from './Brand'

const visibleCategories = ['Двигатель', 'Тормозная система', 'Подвеска', 'Масла и жидкости']

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { count } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const currentCategory = new URLSearchParams(location.search).get('category')
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') as string
    navigate(`/catalog?q=${encodeURIComponent(q ?? '')}`)
    setMenuOpen(false)
  }

  return (
    <header
      className="header atelier-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          setMenuOpen(false)
          event.currentTarget.querySelector<HTMLButtonElement>('.burger')?.focus()
        }
      }}
    >
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Перейти к содержимому
      </a>
      <div className="container header__inner">
        <Brand />

        <form className="search" role="search" onSubmit={handleSearch}>
          <label className="visually-hidden" htmlFor="search-input">
            Поиск запчастей
          </label>
          <input
            className="search__input"
            id="search-input"
            type="search"
            name="q"
            placeholder="Поиск по названию или артикулу"
            autoComplete="off"
          />
          <button className="search__btn" type="submit">
            Найти
          </button>
        </form>

        <div className="header__actions">
          <Link className="header__action" to="/orders">
            <span className="header__action-label">Панель заказов</span>
            <span className="header__action-value">Заказы</span>
          </Link>
          <Link className="header__action header__cart" to="/cart" aria-label="Корзина">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 3h2l2.5 12h11l2-8H6" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className="header__action-value">Корзина</span>
            {count > 0 && (
              <span className="header__cart-count" aria-label="товаров в корзине">
                {count}
              </span>
            )}
          </Link>
        </div>

        <button
          className="burger"
          type="button"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav className={`nav${menuOpen ? ' is-open' : ''}`} id="main-nav" aria-label="Основное меню">
        <div className="container">
          <ul className="nav__list">
            <li>
              <Link
                className={`nav__link nav__link--catalog${location.pathname === '/catalog' && !currentCategory ? ' active' : ''}`}
                aria-current={
                  location.pathname === '/catalog' && !currentCategory ? 'page' : undefined
                }
                to="/catalog"
                onClick={() => setMenuOpen(false)}
              >
                Весь каталог <span aria-hidden="true">↗</span>
              </Link>
            </li>
            {visibleCategories.map((cat) => (
              <li key={cat}>
                <Link
                  className={`nav__link${location.pathname === '/catalog' && currentCategory === cat ? ' active' : ''}`}
                  aria-current={
                    location.pathname === '/catalog' && currentCategory === cat ? 'page' : undefined
                  }
                  to={`/catalog?category=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {cat}
                </Link>
              </li>
            ))}
            <li className="nav__workflow">
              <NavLink className="nav__link" to="/orders" onClick={() => setMenuOpen(false)}>
                Заказы
              </NavLink>
            </li>
            <li>
              <NavLink className="nav__link" to="/project" onClick={() => setMenuOpen(false)}>
                О сайте
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
