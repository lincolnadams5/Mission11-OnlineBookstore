import { createContext, useState } from 'react'
import type { Book } from '../types/Book'

export interface CartItem {
  book: Book
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (book: Book) => void
  removeFromCart: (bookId: number) => void
  updateQuantity: (bookId: number, qty: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (book: Book) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.book.id === book.id)
      if (existing) {
        return prev.map((item) =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { book, quantity: 1 }]
    })
  }

  const removeFromCart = (bookId: number) => {
    setCartItems((prev) => prev.filter((item) => item.book.id !== bookId))
  }

  const updateQuantity = (bookId: number, qty: number) => {
    if (qty < 1) return
    setCartItems((prev) =>
      prev.map((item) => (item.book.id === bookId ? { ...item, quantity: qty } : item))
    )
  }

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }
