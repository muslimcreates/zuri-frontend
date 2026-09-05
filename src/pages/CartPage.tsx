import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatTRY } from "../lib/money";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { items, loading, setQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (loading) return <p className="page-loading">Loading your cart…</p>;

  // A product can go inactive (hidden by the admin) after it was added to
  // someone's cart — the server still returns that line (see the backend's
  // GET /api/cart), so filter it out here rather than let someone try to
  // buy something no longer for sale.
  const rows = items.filter((i) => i.product.active);
  const droppedCount = items.length - rows.length;

  const subtotalKurus = rows.reduce((sum, r) => sum + r.product.priceKurus * r.quantity, 0);

  async function handleSetQuantity(productId: string, quantity: number) {
    try {
      setError(null);
      await setQuantity(productId, quantity);
    } catch {
      setError("Couldn't update that item. Please try again.");
    }
  }

  async function handleRemove(productId: string) {
    try {
      setError(null);
      await removeFromCart(productId);
    } catch {
      setError("Couldn't remove that item. Please try again.");
    }
  }

  async function handleClear() {
    try {
      setError(null);
      await clearCart();
    } catch {
      setError("Couldn't clear your cart. Please try again.");
    }
  }

  if (rows.length === 0) {
    return (
      <div className="page">
        <h1>Your cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/shop" className="button-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your cart</h1>
      {droppedCount > 0 && (
        <p className="page-error">
          {droppedCount} item(s) in your cart are no longer available and were removed.
        </p>
      )}
      {error && <p className="page-error">{error}</p>}

      {/* Wrapped in a horizontally-scrollable container, not the page itself
          — five columns plus an image never fit a phone width, and without
          this the whole page would gain a horizontal scrollbar and visibly
          shift/wobble instead of just this table scrolling in place. */}
      <div className="table-scroll">
        <table className="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, quantity }) => {
              // Only cap by stock when there's real stock on hand to avoid
              // overselling it — a 0/unset stock just means this one is
              // sourced per order, so it isn't a limit on quantity.
              const hasStockOnHand = product.fulfillmentType === "STOCKED" && (product.stock ?? 0) > 0;
              const maxQuantity = hasStockOnHand ? (product.stock as number) : 99;
              return (
                <tr key={product.id}>
                  <td className="cart-product-cell">
                    <img src={product.imageUrl} alt={product.name} />
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>
                  </td>
                  <td>{formatTRY(product.priceKurus)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={maxQuantity || undefined}
                      value={quantity}
                      onChange={(e) =>
                        handleSetQuantity(product.id, Math.max(1, Number(e.target.value) || 1))
                      }
                    />
                  </td>
                  <td>{formatTRY(product.priceKurus * quantity)}</td>
                  <td>
                    <button type="button" className="link-button" onClick={() => handleRemove(product.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="cart-summary">
        <p>
          Subtotal: <strong>{formatTRY(subtotalKurus)}</strong>
        </p>
        <div className="cart-summary-actions">
          <button type="button" className="link-button" onClick={handleClear}>
            Clear cart
          </button>
          <button type="button" className="button-primary" onClick={() => navigate("/checkout")}>
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
