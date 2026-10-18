import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import './index.css'
import './redesign.css'
import './home-redesign.css'
import './content-redesign.css'
import './catalog-redesign.css'
import './workflow-redesign.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Hash routes keep deep links portable between static hosting environments. */}
    <HashRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </HashRouter>
  </StrictMode>,
)
