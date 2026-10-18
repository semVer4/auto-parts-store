import { Link } from 'react-router-dom'

export default function Project() {
  return (
    <div className="container workflow-page project-page editorial-content">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ul className="breadcrumbs__list">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <span aria-current="page">О проекте</span>
          </li>
        </ul>
      </nav>
      <div className="project-hero">
        <div>
          <span className="workflow-eyebrow">Под капотом / О проекте</span>
          <h1>
            Из витрины — <br />
            <span>в рабочий сценарий.</span>
          </h1>
          <p>
            АвтоДеталь — демонстрационный проект интернет-магазина. Главный сценарий: выбрать товар,
            создать заказ, проверить сохранение и изменить его статус.
          </p>
          <div className="workflow-actions">
            <Link className="btn btn--primary" to="/catalog">
              Проверить демо
            </Link>
            <a
              className="btn btn--secondary"
              href="https://github.com/semVer4/auto-parts-store"
              target="_blank"
              rel="noreferrer"
            >
              Исходный код ↗
            </a>
          </div>
        </div>
        <div className="project-diagram" aria-label="Сценарий проекта">
          <p className="project-diagram__label">От интерфейса до результата</p>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Каталог и корзина</strong>
                <p>React / TypeScript</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Проверка и расчёт</strong>
                <p>Netlify Functions / API</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Сохранённый заказ</strong>
                <p>Netlify Blobs / отдельная сессия</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <strong>Статусы и история</strong>
                <p>Контроль версии и переходов</p>
              </div>
            </li>
          </ol>
          <p className="project-diagram__foot">
            Данные сохраняются на сервере, а не только на экране.
          </p>
        </div>
      </div>
      <section className="project-section">
        <span className="workflow-eyebrow">Что реализовано</span>
        <h2>Детали реализации.</h2>
        <div className="project-grid">
          <article>
            <span className="project-card__number">01</span>
            <h3>Реальное сохранение</h3>
            <p>
              React-интерфейс отправляет заказ в API. Сервер проверяет входные данные и рассчитывает
              стоимость по собственному каталогу. Сохранённый заказ доступен после перезагрузки.
            </p>
          </article>
          <article>
            <span className="project-card__number">02</span>
            <h3>Обработка ошибок</h3>
            <p>
              Корзина не очищается при ошибке. Повторная отправка неизменённого запроса использует
              тот же ключ идемпотентности. Сетевые и серверные ошибки отображаются в интерфейсе.
            </p>
          </article>
          <article>
            <span className="project-card__number">03</span>
            <h3>Жизненный цикл заказа</h3>
            <p>
              Разрешённые переходы статусов и история изменений. Проверка версии защищает от
              незаметного перезаписывания заказа из другой вкладки.
            </p>
          </article>
          <article>
            <span className="project-card__number">04</span>
            <h3>Проверяемый результат</h3>
            <p>
              Типизация TypeScript, автоматизированные проверки бизнес-логики и браузерных
              сценариев. Команды запуска и ограничения описаны в репозитории.
            </p>
          </article>
        </div>
      </section>
      <section className="project-section project-demo">
        <div>
          <span className="workflow-eyebrow">Проверка за несколько минут</span>
          <h2>Пройдите весь путь.</h2>
          <p>
            Никакой регистрации и банковской карты. Используйте кнопку заполнения тестовыми данными.
          </p>
        </div>
        <ol className="project-steps">
          <li>
            <span>1</span>
            <div>
              <strong>Добавьте любой товар</strong>
              <p>В каталоге доступны поиск, фильтры и сортировка.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Создайте демо-заказ</strong>
              <p>Выберите доставку и проверьте изменение итоговой суммы.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Откройте «Заказы»</strong>
              <p>Обновите страницу: заказ остаётся на сервере.</p>
            </div>
          </li>
          <li>
            <span>4</span>
            <div>
              <strong>Измените статус</strong>
              <p>Подтвердите заказ, затем отметьте отправленным. Проверьте историю.</p>
            </div>
          </li>
        </ol>
      </section>
      <section className="project-section">
        <span className="workflow-eyebrow">Осознанные ограничения</span>
        <h2>Это портфолио, а не действующий магазин</h2>
        <div className="project-limitations">
          <p>
            <strong>Без реальных платежей и доставки.</strong> Платёжный шлюз, почтовые уведомления,
            складской учёт и внешняя CRM не подключены.
          </p>
          <p>
            <strong>Изолированная демо-сессия вместо авторизации.</strong> Каждому браузеру
            показываются его заказы. Это не полноценная система пользователей, ролей или
            production-админка.
          </p>
          <p>
            <strong>Только тестовые данные.</strong> Не вводите настоящие контакты или адрес.
            Демо-данные могут удаляться; проект не рассчитан на хранение реальных клиентских
            заказов.
          </p>
        </div>
      </section>
      <div className="project-bottom">
        <h2>Проверить на практике?</h2>
        <Link className="btn btn--primary" to="/catalog">
          Открыть каталог →
        </Link>
      </div>
    </div>
  )
}
