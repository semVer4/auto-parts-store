import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contacts() {
  const [sent, setSent] = useState(false)

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li><Link to="/">Главная</Link></li>
          <li><span aria-current="page">Контакты</span></li>
        </ul>
      </nav>

      <div className="page-head">
        <h1 className="page-head__title">Контакты</h1>
      </div>

      <div className="contacts">
        <div className="contacts__info">
          <p><strong>Телефон:</strong><br /><a href="tel:+78001234567">8 800 123-45-67</a> (бесплатно по России)</p>
          <p><strong>E-mail:</strong><br /><a href="mailto:info@avtodetal.ru">info@avtodetal.ru</a></p>
          <p><strong>Адрес:</strong><br />г. Москва, ул. Автозаводская, 12</p>
          <p><strong>Режим работы:</strong><br />Ежедневно с 9:00 до 21:00</p>

          {sent ? (
            <div className="notice">Сообщение отправлено! Мы ответим вам в ближайшее время.</div>
          ) : (
            <form className="form-grid" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
              <div className="field">
                <label className="field__label" htmlFor="c-name">Имя <span>*</span></label>
                <input className="field__input" id="c-name" name="name" required />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="c-phone">Телефон <span>*</span></label>
                <input className="field__input" id="c-phone" name="phone" type="tel" required />
              </div>
              <div className="field field--full">
                <label className="field__label" htmlFor="c-msg">Сообщение</label>
                <textarea className="field__textarea" id="c-msg" name="message"></textarea>
              </div>
              <div className="field--full">
                <button className="btn btn--primary" type="submit">Отправить</button>
              </div>
            </form>
          )}
        </div>

        <div className="contacts__map" role="img" aria-label="Карта расположения магазина"></div>
      </div>
    </div>
  )
}
