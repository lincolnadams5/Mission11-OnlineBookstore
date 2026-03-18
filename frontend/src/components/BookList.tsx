import { useEffect, useState } from 'react'
import type { Book } from '../types/Book'
import BookCard from './BookCard'

function BookList() {
  // State for books, pagination, and total count
  const [books, setBooks] = useState<Book[]>([])
  const [pageSize, setPageSize] = useState<number>(5)
  const [pageNum, setPageNum] = useState<number>(1)
  const [totalNumBooks, setTotalNumBooks] = useState<number>(0)

  const totalPages = Math.ceil(totalNumBooks / pageSize)

  // Fetch books whenever pageSize or pageNum changes
  useEffect(() => {
    const fetchBooks = async () => {
      const res = await fetch(
        `http://localhost:5173/api/Books/books?pageSize=${pageSize}&pageNum=${pageNum}`
      )
      const data = await res.json()
      setBooks(data.books.map((b: Record<string, unknown>) => ({ ...b, id: b.bookID })))
      setTotalNumBooks(data.totalNumBooks)
    }

    fetchBooks()
  }, [pageSize, pageNum])

  return (
    <div className="container py-4">
      {/* Pagination Controls */}
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
      <div className="row row-cols-3 g-3">
        {books.map((book) => (
          <div className="col" key={book.id}>
            <BookCard book={book} />
          </div>
        ))}
      </div>

      {/* Pagination Navigation */}
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
  )
}

export default BookList
