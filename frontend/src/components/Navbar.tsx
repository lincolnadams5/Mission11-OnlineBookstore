import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'

export function Navbar() {
  const { cartItems } = useCart()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Online Bookstore
        </Link>
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
