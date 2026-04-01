import { useState, useEffect } from 'react'

interface BookRecord {
  bookID: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

const emptyBook: BookRecord = {
  bookID: 0,
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
}

const stringFields = ['title', 'author', 'publisher', 'isbn', 'classification', 'category'] as const

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookRecord[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<BookRecord>(emptyBook)
  const [newBook, setNewBook] = useState<BookRecord>(emptyBook)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  function fetchBooks() {
    fetch('/api/books/all')
      .then((res) => res.json())
      .then(setBooks)
  }

  function startEdit(book: BookRecord) {
    setEditingId(book.bookID)
    setEditForm({ ...book })
    setDeleteConfirmId(null)
  }

  function saveEdit() {
    fetch(`/api/books/${editForm.bookID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    }).then(() => {
      setEditingId(null)
      fetchBooks()
    })
  }

  function deleteBook(id: number) {
    fetch(`/api/books/${id}`, { method: 'DELETE' }).then(() => {
      setDeleteConfirmId(null)
      fetchBooks()
    })
  }

  function addBook() {
    fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newBook, bookID: 0 }),
    }).then(() => {
      setNewBook(emptyBook)
      fetchBooks()
    })
  }

  return (
    <div className="container-fluid mt-4">
      <h2>Admin — Manage Books</h2>

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-bordered table-sm align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>ISBN</th>
              <th>Classification</th>
              <th>Category</th>
              <th>Pages</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) =>
              editingId === book.bookID ? (
                <tr key={book.bookID}>
                  <td>{book.bookID}</td>
                  {stringFields.map((field) => (
                    <td key={field}>
                      <input
                        className="form-control form-control-sm"
                        value={editForm[field]}
                        onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={editForm.pageCount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, pageCount: parseInt(e.target.value) || 0 })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-control-sm"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </td>
                  <td>
                    <button className="btn btn-sm btn-success me-1" onClick={saveEdit}>
                      Save
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={book.bookID}>
                  <td>{book.bookID}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td>{book.isbn}</td>
                  <td>{book.classification}</td>
                  <td>{book.category}</td>
                  <td>{book.pageCount}</td>
                  <td>${book.price.toFixed(2)}</td>
                  <td>
                    {deleteConfirmId === book.bookID ? (
                      <>
                        <span className="me-2">Delete?</span>
                        <button
                          className="btn btn-sm btn-danger me-1"
                          onClick={() => deleteBook(book.bookID)}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-primary me-1"
                          onClick={() => startEdit(book)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setDeleteConfirmId(book.bookID)
                            setEditingId(null)
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <h4 className="mt-4">Add New Book</h4>
      <div className="row g-2 align-items-end">
        {stringFields.map((field) => (
          <div className="col-md-2" key={field}>
            <label className="form-label text-capitalize">{field}</label>
            <input
              className="form-control"
              value={newBook[field]}
              onChange={(e) => setNewBook({ ...newBook, [field]: e.target.value })}
            />
          </div>
        ))}
        <div className="col-md-1">
          <label className="form-label">Pages</label>
          <input
            type="number"
            className="form-control"
            value={newBook.pageCount || ''}
            onChange={(e) => setNewBook({ ...newBook, pageCount: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="col-md-1">
          <label className="form-label">Price</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            value={newBook.price || ''}
            onChange={(e) => setNewBook({ ...newBook, price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="col-md-1">
          <button className="btn btn-success" onClick={addBook}>
            Add Book
          </button>
        </div>
      </div>
    </div>
  )
}
