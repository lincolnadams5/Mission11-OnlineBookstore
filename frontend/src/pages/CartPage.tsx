import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/useCart'

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
                <td colSpan={3} className="text-end fw-bold">
                  Total:
                </td>
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
