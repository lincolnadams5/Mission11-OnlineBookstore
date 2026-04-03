const BASE_URL = 'https://onlinebookstore-m13-cha4gfaverh8gycu.francecentral-01.azurewebsites.net'

export interface BookRecord {
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

export interface BooksResponse {
  books: BookRecord[]
  totalNumBooks: number
}

export async function getCategories(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/api/books/categories`)
  return res.json()
}

export async function getBooks(
  pageSize: number,
  pageNum: number,
  category?: string
): Promise<BooksResponse> {
  const url = `${BASE_URL}/api/books?pageSize=${pageSize}&pageNum=${pageNum}${category ? `&category=${encodeURIComponent(category)}` : ''}`
  const res = await fetch(url)
  return res.json()
}

export async function getAllBooks(): Promise<BookRecord[]> {
  const res = await fetch(`${BASE_URL}/api/books/all`)
  return res.json()
}

export async function addBook(book: BookRecord): Promise<void> {
  await fetch(`${BASE_URL}/api/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...book, bookID: 0 }),
  })
}

export async function updateBook(id: number, book: BookRecord): Promise<void> {
  await fetch(`${BASE_URL}/api/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  })
}

export async function deleteBook(id: number): Promise<void> {
  await fetch(`${BASE_URL}/api/books/${id}`, { method: 'DELETE' })
}
