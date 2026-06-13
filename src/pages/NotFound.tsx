import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty" style={{ padding: '80px 16px' }}>
        <p className="empty__title" style={{ fontSize: 48 }}>404</p>
        <p className="empty__title">Страница не найдена</p>
        <p>Возможно, она была перемещена или удалена.</p>
        <p style={{ marginTop: 16 }}>
          <Link className="btn btn--primary" to="/">На главную</Link>
        </p>
      </div>
    </div>
  )
}
