import { Link } from 'react-router-dom'

export default function Contacts() {
  return (
    <div className="container workflow-page editorial-content help-page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <span aria-current="page">Помощь</span>
          </li>
        </ul>
      </nav>
      <div className="page-head">
        <span className="workflow-eyebrow">Полезные детали / Помощь</span>
        <h1 className="page-head__title">Поможем разобраться.</h1>
        <p className="workflow-muted">
          Как оформить заказ, где найти его статус и что можно проверить в проекте.
        </p>
      </div>
      <p className="help-note">
        <strong>Используйте только синтетические данные.</strong> Не указывайте настоящий телефон,
        e-mail или адрес. На странице оформления есть кнопка «Заполнить тестовыми данными». Оплата,
        отправка писем и реальная доставка не выполняются.
      </p>
      <div className="project-grid">
        <section className="checkout-block">
          <span className="project-card__number">01 / Начать</span>
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
          <span className="project-card__number">02 / Разобраться</span>
          <h2 className="checkout-block__title">Архитектура и ограничения</h2>
          <p className="workflow-muted">
            Описание реализации, инструкция по проверке и границы демонстрационного проекта.
          </p>
          <Link className="workflow-text-link" to="/project">
            Как устроен проект →
          </Link>
        </section>
        <section className="checkout-block">
          <span className="project-card__number">03 / Посмотреть код</span>
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
          <span className="project-card__number">04 / Сохранённые данные</span>
          <h2 className="checkout-block__title">Заказы и доступ</h2>
          <p className="workflow-muted">
            Отображаются заказы вашей браузерной демо-сессии. В другом браузере или после удаления
            cookie список будет другим. Полноценная авторизация и роли не реализованы.
          </p>
        </section>
      </div>
      <section className="help-faq" aria-labelledby="help-faq-title">
        <div>
          <span className="workflow-eyebrow">Короткие ответы</span>
          <h2 id="help-faq-title">Частые вопросы.</h2>
          <p>Самое важное перед проверкой заказа.</p>
        </div>
        <div className="help-faq__items">
          <details>
            <summary>Нужно ли оплачивать заказ?</summary>
            <p>
              Нет. Это портфолио-проект: платежи и реальные поставки не подключены. Для проверки
              используйте тестовые данные.
            </p>
          </details>
          <details>
            <summary>Где найти созданный заказ?</summary>
            <p>
              Откройте раздел «Заказы» в том же браузере. Заказ сохраняется на сервере и остаётся
              после обновления страницы, пока доступна ваша сессия.
            </p>
          </details>
          <details>
            <summary>Что делать, если оформление не прошло?</summary>
            <p>
              Проверьте отмеченные поля и соединение с интернетом, затем повторите отправку. При
              ошибке API корзина сохраняется; успешный заказ появится в разделе «Заказы».
            </p>
          </details>
          <details>
            <summary>Фотографии показывают точную модель детали?</summary>
            <p>
              Изображения иллюстративные, а каталог демонстрационный. Они не подтверждают
              совместимость, комплектацию или реальные характеристики конкретного артикула.
            </p>
          </details>
        </div>
      </section>
    </div>
  )
}
