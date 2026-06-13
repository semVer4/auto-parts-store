import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <Link className="logo logo--light" to="/" aria-label="АвтоДеталь — на главную">
            <span className="logo__text">Авто<span>Деталь</span></span>
          </Link>
          <p className="footer__about">
            Интернет-магазин автозапчастей для всех марок автомобилей. Работаем с 2010 года.
          </p>
        </div>

        <nav className="footer__col" aria-label="Каталог">
          <h3 className="footer__title">Каталог</h3>
          <ul className="footer__list">
            <li><Link to="/catalog?category=Двигатель">Двигатель</Link></li>
            <li><Link to="/catalog?category=Тормозная система">Тормозная система</Link></li>
            <li><Link to="/catalog?category=Подвеска">Подвеска</Link></li>
            <li><Link to="/catalog?category=Масла и жидкости">Масла и жидкости</Link></li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Покупателям">
          <h3 className="footer__title">Покупателям</h3>
          <ul className="footer__list">
            <li><Link to="/checkout">Доставка и оплата</Link></li>
            <li><Link to="/">Гарантия и возврат</Link></li>
            <li><Link to="/">О компании</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
        </nav>

        <div className="footer__col">
          <h3 className="footer__title">Контакты</h3>
          <address className="footer__contacts">
            <a href="tel:+78001234567">8 800 123-45-67</a><br />
            <a href="mailto:info@avtodetal.ru">info@avtodetal.ru</a><br />
            г. Москва, ул. Автозаводская, 12<br />
            Ежедневно с 9:00 до 21:00
          </address>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© 2010–2026 АвтоДеталь. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
