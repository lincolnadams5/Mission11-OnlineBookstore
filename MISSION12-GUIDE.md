# Mission 12 — Step-by-Step Implementation Guide

## Overview
You'll be adding three things to your existing bookstore:
1. **Category filter** — filter books by category; pagination resets when filter changes
2. **Shopping cart** — add books, view cart, update quantities, persist during session, "Continue Shopping" returns to where you left off
3. **Two new Bootstrap features** — Navbar and List Group

---

## Step 1 — Backend: Update BooksController

**File:** `backend/Controllers/BooksController.cs`

### 1A. Add category filter to the existing `GetBooks` endpoint

Change the method signature and query to accept an optional `category` parameter:

```csharp
[HttpGet("books")]
public async Task<IActionResult> GetBooks(int pageSize, int pageNum = 1, string? category = null)
{
    var query = _context.Books.AsQueryable();

    if (!string.IsNullOrEmpty(category))
        query = query.Where(b => b.Category == category);

    var books = query
        .Skip((pageNum - 1) * pageSize)
        .Take(pageSize)
        .ToList();

    var totalNumBooks = query.Count();

    var response = new { Books = books, TotalNumBooks = totalNumBooks };
    return Ok(response);
}
```

### 1B. Add a new `/categories` endpoint

Add this method to the same controller:

```csharp
[HttpGet("categories")]
public IActionResult GetCategories()
{
    var categories = _context.Books
        .Select(b => b.Category)
        .Distinct()
        .OrderBy(c => c)
        .ToList();

    return Ok(categories);
}
```

---

## Step 2 — Frontend: Install React Router

Run in the `frontend/` directory:

```bash
npm install react-router-dom
```

---

## Step 3 — Frontend: Create CartContext

**New file:** `frontend/src/context/CartContext.tsx`

```tsx
import { createContext, useContext, useState } from 'react'
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

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
```

---

## Step 4 — Frontend: Update App.tsx

**File:** `frontend/src/App.tsx`

Replace the entire file:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { useCart } from './context/CartContext'
import { Link } from 'react-router-dom'
import BookList from './components/BookList'
import CartPage from './pages/CartPage'
import './App.css'

function Navbar() {
  const { cartItems } = useCart()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Online Bookstore</Link>
        <div className="ms-auto">
          <Link className="nav-link text-white" to="/cart">
            Cart
            {totalItems > 0 && (
              <span className="badge bg-warning text-dark ms-1">{totalItems}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
```

> **Bootstrap Feature #1:** `navbar`, `navbar-expand-lg`, `navbar-dark`, `bg-dark`, `navbar-brand`, `badge` — this is one of your two new Bootstrap things.

---

## Step 5 — Frontend: Update BookList with Category Filter + Cart Integration

**File:** `frontend/src/components/BookList.tsx`

Replace the entire file:

```tsx
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Book } from '../types/Book'
import BookCard from './BookCard'
import CartSummary from './CartSummary'
import { useCart } from '../context/CartContext'

function BookList() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // Restore page/category from "Continue Shopping" navigation state
  const incoming = location.state as { toPage?: number; toCategory?: string } | null

  const [books, setBooks] = useState<Book[]>([])
  const [pageSize, setPageSize] = useState<number>(5)
  const [pageNum, setPageNum] = useState<number>(incoming?.toPage ?? 1)
  const [totalNumBooks, setTotalNumBooks] = useState<number>(0)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(incoming?.toCategory ?? '')

  const totalPages = Math.ceil(totalNumBooks / pageSize)

  // Fetch categories once on mount
  useEffect(() => {
    fetch('/api/books/categories')
      .then((res) => res.json())
      .then(setCategories)
  }, [])

  // Fetch books when pageSize, pageNum, or selectedCategory changes
  useEffect(() => {
    const url = `/api/books/books?pageSize=${pageSize}&pageNum=${pageNum}${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.books.map((b: Record<string, unknown>) => ({ ...b, id: b.bookID })))
        setTotalNumBooks(data.totalNumBooks)
      })
  }, [pageSize, pageNum, selectedCategory])

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setPageNum(1)
  }

  const handleAddToCart = (book: Book) => {
    addToCart(book)
    navigate('/cart', { state: { fromPage: pageNum, fromCategory: selectedCategory } })
  }

  return (
    <div className="container py-4">
      <div className="row">

        {/* Sidebar: Category Filter (Bootstrap Feature #2 — List Group) */}
        <div className="col-12 col-md-3 mb-4">
          <h6 className="fw-bold mb-2">Categories</h6>
          <ul className="list-group">
            <li
              className={`list-group-item list-group-item-action ${selectedCategory === '' ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCategorySelect('')}
            >
              All
            </li>
            {categories.map((cat) => (
              <li
                key={cat}
                className={`list-group-item list-group-item-action ${selectedCategory === cat ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>

          {/* Cart Summary */}
          <div className="mt-4">
            <CartSummary currentPage={pageNum} currentCategory={selectedCategory} />
          </div>
        </div>

        {/* Main Content */}
        <div className="col-12 col-md-9">
          {/* Controls */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <label className="d-flex align-items-center gap-2">
              Books per page:
              <select
                className="form-select form-select-sm w-auto"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPageNum(1)
                }}
              >
                {[5, 10, 20].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <span className="text-muted small">Page {pageNum} of {totalPages}</span>
          </div>

          {/* Book Grid */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
            {books.map((book) => (
              <div className="col" key={book.id}>
                <BookCard book={book} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <nav className="mt-4">
            <ul className="pagination justify-content-center flex-wrap">
              <li className={`page-item ${pageNum === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPageNum((p) => p - 1)}>
                  &larr; Prev
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li key={n} className={`page-item ${n === pageNum ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPageNum(n)}>{n}</button>
                </li>
              ))}
              <li className={`page-item ${pageNum === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPageNum((p) => p + 1)}>
                  Next &rarr;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default BookList
```

> **Bootstrap Feature #2:** `list-group`, `list-group-item`, `list-group-item-action`, `active` — this is your second new Bootstrap thing.

---

## Step 6 — Frontend: Update BookCard

**File:** `frontend/src/components/BookCard.tsx`

Replace the entire file:

```tsx
import type { Book } from '../types/Book'

function BookCard({ book, onAddToCart }: { book: Book; onAddToCart: (book: Book) => void }) {
  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column gap-2">
        <h5 className="card-title">{book.title}</h5>
        <p className="card-subtitle text-muted">by {book.author}</p>

        <div className="d-flex gap-2 justify-content-center">
          <span className="badge text-bg-primary">{book.category}</span>
          <span className="badge text-bg-secondary">{book.classification}</span>
        </div>

        <ul className="list-unstyled small text-secondary mb-0">
          <li><strong>Publisher:</strong> {book.publisher}</li>
          <li><strong>ISBN:</strong> {book.isbn}</li>
          <li><strong>Pages:</strong> {book.pageCount}</li>
        </ul>

        <p className="fw-bold text-success fs-5 mb-0 mt-auto">${book.price.toFixed(2)}</p>

        <button
          className="btn btn-primary btn-sm mt-2"
          onClick={() => onAddToCart(book)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default BookCard
```

---

## Step 7 — Frontend: Create CartSummary Component

**New file:** `frontend/src/components/CartSummary.tsx`

```tsx
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartSummary({ currentPage, currentCategory }: { currentPage: number; currentCategory: string }) {
  const { cartItems } = useCart()
  const navigate = useNavigate()

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0)

  if (totalItems === 0) return null

  return (
    <div className="card border-success">
      <div className="card-header bg-success text-white fw-bold">Cart Summary</div>
      <div className="card-body">
        <p className="mb-1 small">Items: <strong>{totalItems}</strong></p>
        <p className="mb-2 small">Total: <strong>${totalPrice.toFixed(2)}</strong></p>
        <button
          className="btn btn-success btn-sm w-100"
          onClick={() => navigate('/cart', { state: { fromPage: currentPage, fromCategory: currentCategory } })}
        >
          View Cart
        </button>
      </div>
    </div>
  )
}

export default CartSummary
```

---

## Step 8 — Frontend: Create CartPage

**New file:** `frontend/src/pages/CartPage.tsx`

First, create the `pages/` directory inside `src/`, then create this file:

```tsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as { fromPage?: number; fromCategory?: string } | null
  const fromPage = state?.fromPage ?? 1
  const fromCategory = state?.fromCategory ?? ''

  const total = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0)

  return (
    <div className="container py-4">
      <h2 className="mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-muted">Your cart is empty.</p>
      ) : (
        <>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.book.id}>
                  <td>{item.book.title}</td>
                  <td>${item.book.price.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: '70px' }}
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.book.id, Number(e.target.value))}
                    />
                  </td>
                  <td>${(item.book.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeFromCart(item.book.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="text-end fw-bold">Total:</td>
                <td className="fw-bold">${total.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </>
      )}

      <button
        className="btn btn-secondary"
        onClick={() => navigate('/', { state: { toPage: fromPage, toCategory: fromCategory } })}
      >
        &larr; Continue Shopping
      </button>
    </div>
  )
}

export default CartPage
```

---

## Checklist Before Submitting

- [ ] Category filter shows all categories from DB; selecting one filters books and resets to page 1
- [ ] "All" option clears the category filter
- [ ] Pagination count reflects filtered results (not total DB count)
- [ ] "Add to Cart" on a BookCard navigates to cart and adds the book
- [ ] Cart shows title, price, editable quantity, subtotal per item, and order total
- [ ] Changing quantity in cart updates subtotal and total
- [ ] "Remove" deletes item from cart
- [ ] "Continue Shopping" returns to the exact page number and category you were on
- [ ] Cart Summary widget is visible on the book list page when cart has items
- [ ] Cart badge in Navbar shows correct item count
- [ ] Two Bootstrap features are working: **Navbar** and **List Group**

---

## Learning Suite Comment (copy this)

> Bootstrap features added:
> 1. **Navbar** — `navbar`, `navbar-expand-lg`, `navbar-dark`, `bg-dark`, `navbar-brand`, `badge` in `App.tsx`. Wraps the header with a cart item-count badge.
> 2. **List Group** — `list-group`, `list-group-item`, `list-group-item-action`, `active` in `BookList.tsx`. Used for the category filter sidebar.
