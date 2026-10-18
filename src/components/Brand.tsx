import { Link } from 'react-router-dom'

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      className={`brand${light ? ' brand--light' : ''}`}
      to="/"
      aria-label="АвтоДеталь — на главную"
    >
      <svg
        className="brand__mark"
        width="30"
        height="25"
        viewBox="0 0 36 28"
        aria-hidden="true"
        focusable="false"
      >
        <path fill="currentColor" d="M0 28 12 0h7L7 28Zm17 0L29 0h7L24 28Z" />
      </svg>
      <span className="brand__wordmark">
        АВТОДЕТАЛЬ<span className="brand__dot">.</span>
      </span>
    </Link>
  )
}
