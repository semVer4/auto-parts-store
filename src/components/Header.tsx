import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { navCategories } from '../data/products'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { count } = useCart()
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') as string
    navigate(`/catalog?q=${encodeURIComponent(q ?? '')}`)
  }

  return (
    <header className="header">
      <div className="demo-strip">
        <div className="container">
          <span>
            <strong>DEMO</strong> Портфолио-проект. Без реальных покупок и оплаты.
          </span>
          <Link to="/project">
            О проекте <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
      <div className="container header__inner">
        <Link className="logo" to="/" aria-label="АвтоДеталь — на главную">
          <svg
            className="logo__icon"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="currentColor"
              d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6Zm0 2.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z"
            />
          </svg>
          <span className="logo__text">
            Авто<span>Деталь</span>
          </span>
        </Link>

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
            <span className="header__action-label">Демо-панель</span>
            <span className="header__action-value">Заказы</span>
          </Link>
          <Link className="header__action header__cart" to="/cart">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.2 4l.94 2H21l-3 8H8l-.6 1.6L7 17h12v2H6a1 1 0 0 1-.94-1.34L6.6 13 3.7 6H1V4h5.2Z"
              />
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
            {navCategories.map((cat) => (
              <li key={cat}>
                <NavLink
                  className="nav__link"
                  to={`/catalog?category=${encodeURIComponent(cat)}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {cat}
                </NavLink>
              </li>
            ))}
            <li className="nav__workflow">
              <NavLink className="nav__link" to="/orders" onClick={() => setMenuOpen(false)}>
                Заказы
              </NavLink>
            </li>
            <li>
              <NavLink className="nav__link" to="/project" onClick={() => setMenuOpen(false)}>
                О проекте
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
