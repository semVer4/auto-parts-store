import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container editorial-not-found">
      <span className="editorial-not-found__code" aria-hidden="true">
        404
      </span>
      <div>
        <p className="editorial-kicker">Не тот поворот / Ошибка 404</p>
        <h1>
          Этой страницы
          <br />
          нет на маршруте.
        </h1>
        <p>Возможно, ссылка устарела. Вернитесь на главную или найдите нужную деталь в каталоге.</p>
        <div className="workflow-actions">
          <Link className="btn btn--primary" to="/">
            На главную
          </Link>
          <Link className="btn btn--secondary" to="/catalog">
            Открыть каталог
          </Link>
        </div>
      </div>
    </div>
  )
}
