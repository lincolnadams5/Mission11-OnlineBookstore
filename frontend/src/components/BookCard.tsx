import type { Book } from '../types/Book'

function BookCard({ book, onAddToCart }: { book: Book; onAddToCart: (book: Book) => void }) {
  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column gap-2">
        {/* Title & Author */}
        <h5 className="card-title">{book.title}</h5>
        <p className="card-subtitle text-muted">by {book.author}</p>

        {/* Badges */}
        <div className="d-flex gap-2 justify-content-center">
          <span className="badge text-bg-primary">{book.category}</span>
          <span className="badge text-bg-secondary">{book.classification}</span>
        </div>

        {/* Details */}
        <ul className="list-unstyled small text-secondary mb-0">
          <li>
            <strong>Publisher:</strong> {book.publisher}
          </li>
          <li>
            <strong>ISBN:</strong> {book.isbn}
          </li>
          <li>
            <strong>Pages:</strong> {book.pageCount}
          </li>
        </ul>
        <p className="fw-bold text-success fs-5 mb-0 mt-auto">${book.price.toFixed(2)}</p>
        <button className="btn btn-primary btn-sm mt-2" onClick={() => onAddToCart(book)}>
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default BookCard
