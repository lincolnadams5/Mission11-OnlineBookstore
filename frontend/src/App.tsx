import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { Navbar } from './components/Navbar'
import BookList from './components/BookList'
import CartPage from './pages/CartPage'
import AdminBooksPage from './pages/AdminBooksPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/adminbooks" element={<AdminBooksPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
