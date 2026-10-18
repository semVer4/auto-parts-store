import { Link } from 'react-router-dom'

export default function Contacts() {
  return (
    <div className="container workflow-page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <span aria-current="page">Помощь с демо</span>
          </li>
        </ul>
      </nav>
      <div className="page-head">
        <span className="workflow-eyebrow">АвтоДеталь / Portfolio</span>
        <h1 className="page-head__title">Помощь с демо</h1>
        <p className="workflow-muted">
          Это демонстрационный проект, а не действующий магазин автозапчастей.
        </p>
      </div>
      <div className="demo-note">
        <strong>Используйте только синтетические данные.</strong> Не указывайте настоящий телефон,
        e-mail или адрес. На странице оформления есть кнопка «Заполнить тестовыми данными». Оплата,
        отправка писем и реальная доставка не выполняются.
      </div>
      <div className="project-grid">
        <section className="checkout-block">
          <h2 className="checkout-block__title">Проверить сценарий</h2>
          <p className="workflow-muted">
            Добавьте товар в корзину, создайте тестовый заказ и измените его статус в демо-панели.
          </p>
          <div className="workflow-actions">
            <Link className="btn btn--primary btn--small" to="/catalog">
              Открыть каталог
            </Link>
            <Link className="btn btn--secondary btn--small" to="/orders">
              Заказы
            </Link>
          </div>
        </section>
        <section className="checkout-block">
          <h2 className="checkout-block__title">Архитектура и ограничения</h2>
          <p className="workflow-muted">
            Описание реализации, инструкция по проверке и границы демонстрационного проекта.
          </p>
          <Link className="workflow-text-link" to="/project">
            Как устроен проект →
          </Link>
        </section>
        <section className="checkout-block">
          <h2 className="checkout-block__title">Исходный код</h2>
          <p className="workflow-muted">
            Код приложения, инструкции по локальному запуску и автоматизированные проверки доступны
            в публичном репозитории.
          </p>
          <a
            className="workflow-text-link"
            href="https://github.com/semVer4/auto-parts-store"
            target="_blank"
            rel="noreferrer"
          >
            Открыть GitHub ↗
          </a>
        </section>
        <section className="checkout-block">
          <h2 className="checkout-block__title">Заказы и доступ</h2>
          <p className="workflow-muted">
            Отображаются заказы вашей браузерной демо-сессии. В другом браузере или после удаления
            cookie список будет другим. Полноценная авторизация и роли не реализованы.
          </p>
        </section>
      </div>
    </div>
  )
}
