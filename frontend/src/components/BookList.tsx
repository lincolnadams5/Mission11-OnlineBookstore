import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Book } from '../types/Book'
import BookCard from './BookCard'
import CartSummary from './CartSummary'
import { useCart } from '../context/useCart'

function BookList() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // Restore page/category from "Continue Shopping" navigate state
  const incoming = location.state as { toPage?: number; toCategory?: string } | null

  // State for books, pagination, and total count
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
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-muted small">
              Page {pageNum} of {totalPages}
            </span>
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
                  <button className="page-link" onClick={() => setPageNum(n)}>
                    {n}
                  </button>
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
