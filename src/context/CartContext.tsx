import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Product } from '../data/products'

export interface CartLine {
  product: Product
  qty: number
}

interface CartState {
  lines: CartLine[]
}

type CartAction =
  | { type: 'add'; product: Product; qty?: number }
  | { type: 'remove'; id: number }
  | { type: 'setQty'; id: number; qty: number }
  | { type: 'clear' }

const STORAGE_KEY = 'avtodetal-cart'

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const qty = action.qty ?? 1
      const existing = state.lines.find((l) => l.product.id === action.product.id)
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.product.id === action.product.id ? { ...l, qty: l.qty + qty } : l,
          ),
        }
      }
      return { lines: [...state.lines, { product: action.product, qty }] }
    }
    case 'remove':
      return { lines: state.lines.filter((l) => l.product.id !== action.id) }
    case 'setQty':
      return {
        lines: state.lines.map((l) =>
          l.product.id === action.id ? { ...l, qty: Math.max(1, action.qty) } : l,
        ),
      }
    case 'clear':
      return { lines: [] }
    default:
      return state
  }
}

function init(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CartState
  } catch {
    /* пустая корзина при ошибке чтения */
  }
  return { lines: [] }
}

interface CartContextValue {
  lines: CartLine[]
  count: number
  total: number
  add: (product: Product, qty?: number) => void
  remove: (id: number) => void
  setQty: (id: number, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((sum, l) => sum + l.qty, 0)
    const total = state.lines.reduce((sum, l) => sum + l.qty * l.product.price, 0)
    return {
      lines: state.lines,
      count,
      total,
      add: (product, qty) => dispatch({ type: 'add', product, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
      clear: () => dispatch({ type: 'clear' }),
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart должен использоваться внутри CartProvider')
  return ctx
}
