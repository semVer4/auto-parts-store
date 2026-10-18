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
        <h1 className="page-head__title">Разберёмся в деталях.</h1>
        <p className="workflow-muted">
          Как найти товар, собрать корзину и просмотреть сохранённый заказ.
        </p>
      </div>
      <p className="help-note">
        <strong>Заказы доступны в браузере оформления.</strong> Они сохраняются на сервере и
        остаются после обновления страницы. Для повторного просмотра используйте тот же браузер на
        том же устройстве.
      </p>
      <div className="project-grid">
        <section className="checkout-block">
          <span className="project-card__number">01 / Подобрать</span>
          <h2 className="checkout-block__title">Найти нужную деталь</h2>
          <p className="workflow-muted">
            Ищите по названию, бренду или артикулу. В каталоге можно уточнить категорию,
            производителя, цену и наличие.
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
          <span className="project-card__number">02 / Собрать</span>
          <h2 className="checkout-block__title">Корзина и оформление</h2>
          <p className="workflow-muted">
            Проверьте состав и количество товаров. При оформлении выберите способ получения и
            ознакомьтесь с пояснениями перед сохранением заказа.
          </p>
          <Link className="workflow-text-link" to="/cart">
            Перейти в корзину →
          </Link>
        </section>
        <section className="checkout-block">
          <span className="project-card__number">03 / Просмотреть</span>
          <h2 className="checkout-block__title">Состав и статус заказа</h2>
          <p className="workflow-muted">
            В разделе «Заказы» указаны номер, состав, сумма и статус. Кнопка обновления загружает
            актуальные сведения, а фильтры помогают выбрать нужный статус.
          </p>
          <Link className="workflow-text-link" to="/orders">
            Открыть заказы →
          </Link>
        </section>
        <section className="checkout-block">
          <span className="project-card__number">04 / Разобраться</span>
          <h2 className="checkout-block__title">Как пользоваться сайтом</h2>
          <p className="workflow-muted">
            Порядок выбора и оформления, возможности каталога и важные пояснения собраны на
            отдельной странице.
          </p>
          <Link className="workflow-text-link" to="/project">
            О сайте →
          </Link>
        </section>
      </div>
      <section className="help-faq" aria-labelledby="help-faq-title">
        <div>
          <span className="workflow-eyebrow">Короткие ответы</span>
          <h2 id="help-faq-title">Частые вопросы.</h2>
          <p>Самое важное о выборе деталей и оформлении.</p>
        </div>
        <div className="help-faq__items">
          <details>
            <summary>Как найти деталь по артикулу?</summary>
            <p>
              Введите артикул в строку поиска. Также можно искать по названию или бренду, а затем
              уточнять результаты с помощью фильтров каталога.
            </p>
          </details>
          <details>
            <summary>Как изменить количество в корзине?</summary>
            <p>
              Используйте кнопки «+» и «−» рядом с товаром или введите количество в поле. Можно
              выбрать от 1 до 20 единиц одной позиции; итог пересчитывается автоматически.
            </p>
          </details>
          <details>
            <summary>Нужно ли оплачивать заказ на сайте?</summary>
            <p>
              Онлайн-оплата и отправка товаров через сайт не выполняются. Дополнительные пояснения
              приведены перед сохранением заказа.
            </p>
          </details>
          <details>
            <summary>Где найти созданный заказ?</summary>
            <p>
              Откройте раздел «Заказы» в том же браузере на том же устройстве. Заказ сохраняется на
              сервере и остаётся после обновления страницы.
            </p>
          </details>
          <details>
            <summary>Почему в другом браузере нет моих заказов?</summary>
            <p>
              Список доступен через браузер, где вы оформляли заказ. Сайт запоминает этот браузер на
              семь дней. В другом браузере или после очистки данных сайта доступ к прежнему списку
              будет утрачен; это не означает удаления записей с сервера.
            </p>
          </details>
          <details>
            <summary>Что делать, если оформление не прошло?</summary>
            <p>
              Проверьте отмеченные поля и соединение с интернетом, затем повторите отправку. При
              ошибке корзина сохраняется. Если подтверждение не пришло, проверьте раздел «Заказы»
              перед повторным оформлением.
            </p>
          </details>
        </div>
      </section>
    </div>
  )
}
