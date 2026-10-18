import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <Link className="logo logo--light" to="/" aria-label="АвтоДеталь — на главную">
            <span className="logo__text">
              Авто<span>Деталь</span>
            </span>
          </Link>
          <p className="footer__about">
            Портфолио-проект: каталог запчастей, оформление и обработка демо-заказов. Не является
            действующим магазином.
          </p>
        </div>

        <nav className="footer__col" aria-label="Каталог">
          <h3 className="footer__title">Каталог</h3>
          <ul className="footer__list">
            <li>
              <Link to="/catalog?category=Двигатель">Двигатель</Link>
            </li>
            <li>
              <Link to="/catalog?category=Тормозная система">Тормозная система</Link>
            </li>
            <li>
              <Link to="/catalog?category=Подвеска">Подвеска</Link>
            </li>
            <li>
              <Link to="/catalog?category=Масла и жидкости">Масла и жидкости</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Покупателям">
          <h3 className="footer__title">Демонстрация</h3>
          <ul className="footer__list">
            <li>
              <Link to="/cart">Корзина</Link>
            </li>
            <li>
              <Link to="/orders">Заказы и статусы</Link>
            </li>
            <li>
              <Link to="/project">Архитектура и ограничения</Link>
            </li>
            <li>
              <a
                href="https://github.com/semVer4/auto-parts-store"
                target="_blank"
                rel="noreferrer"
              >
                Исходный код ↗
              </a>
            </li>
          </ul>
        </nav>

        <div className="footer__col">
          <h3 className="footer__title">Перед проверкой</h3>
          <p className="footer__contacts">
            Используйте только тестовые данные. Оплата не списывается, реальные заказы и доставка не
            выполняются.
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>АвтоДеталь · Демонстрационный проект · React / TypeScript / Serverless API</p>
        </div>
      </div>
    </footer>
  )
}
