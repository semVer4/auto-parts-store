// Share one bootstrap across StrictMode mounts so concurrent first requests
// cannot overwrite the HttpOnly cookie with separate demo sessions.
let bootstrap: Promise<void> | undefined

export function ensureOrderSession(): Promise<void> {
  if (!bootstrap) {
    bootstrap = (async () => {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 10000)
      try {
        const response = await fetch('/api/orders', {
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok)
          throw new Error('Не удалось подготовить демо-сессию. Повторите отправку чуть позже.')
      } finally {
        window.clearTimeout(timeout)
      }
    })().catch((error) => {
      bootstrap = undefined
      throw error
    })
  }
  return bootstrap
}
