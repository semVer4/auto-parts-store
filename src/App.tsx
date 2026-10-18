import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contacts from './pages/Contacts'
import NotFound from './pages/NotFound'
import Orders from './pages/Orders'
import Project from './pages/Project'
import { getProduct } from './data/products'
import './order-workflow.css'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const labels: Record<string, string> = {
      '/': 'Детали для движения',
      '/catalog': new URLSearchParams(search).get('category') || 'Каталог запчастей',
      '/cart': 'Корзина',
      '/checkout': 'Оформление заказа',
      '/orders': 'Заказы',
      '/project': 'О сайте',
      '/contacts': 'Помощь',
    }
    const product = pathname.startsWith('/product/')
      ? getProduct(Number(pathname.split('/')[2]))
      : undefined
    document.title = `${product?.title || labels[pathname] || 'Страница не найдена'} — АвтоДеталь`
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [pathname, search])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/project" element={<Project />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
