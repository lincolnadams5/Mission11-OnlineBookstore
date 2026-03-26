import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'

function CartSummary({
  currentPage,
  currentCategory,
}: {
  currentPage: number
  currentCategory: string
}) {
  const { cartItems } = useCart()
  const navigate = useNavigate()

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0)

  if (totalItems === 0) return null

  return (
    <div className="card border-success">
      <div className="card-header bg-success text-white fw-bold">Cart Summary</div>
      <div className="card-body">
        <p className="mb-1 small">
          Items: <strong>{totalItems}</strong>
        </p>
        <p className="mb-2 small">
          Total: <strong>${totalPrice.toFixed(2)}</strong>
        </p>
        <button
          className="btn btn-success btn-sm w-100"
          onClick={() =>
            navigate('/cart', { state: { fromPage: currentPage, fromCategory: currentCategory } })
          }
        >
          View Cart
        </button>
      </div>
    </div>
  )
}

export default CartSummary
