import { Link } from 'react-router-dom'
import Brand from './Brand'

export default function Footer() {
  return (
    <footer className="footer atelier-footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <Brand light />
          <p className="footer__motto">
            Всё начинается
            <br />с хороших деталей.
          </p>
          <p className="footer__about">
            Каталог автозапчастей. Поиск по названию, производителю и артикулу — для внимания к
            каждой детали.
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
          <h3 className="footer__title">Информация</h3>
          <ul className="footer__list">
            <li>
              <Link to="/cart">Корзина</Link>
            </li>
            <li>
              <Link to="/orders">Заказы и статусы</Link>
            </li>
            <li>
              <Link to="/project">О сайте</Link>
            </li>
            <li>
              <Link to="/contacts">Помощь с заказом</Link>
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
          <h3 className="footer__title">Внимание к деталям</h3>
          <p className="footer__contacts">
            Проверяйте артикул, характеристики и применимость к вашему автомобилю перед выбором
            запчастей.
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>АвтоДеталь · Детали для движения</p>
        </div>
      </div>
    </footer>
  )
}
