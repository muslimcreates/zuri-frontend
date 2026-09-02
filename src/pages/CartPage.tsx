import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Product } from "../lib/types";
import { formatTRY } from "../lib/money";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { lines, setQuantity, removeFromCart, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .products()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-loading">Loading your cart…</p>;

  const byId = new Map(products.map((p) => [p.id, p]));
  const rows = lines
    .map((line) => ({ line, product: byId.get(line.productId) }))
    .filter((r): r is { line: typeof r.line; product: Product } => Boolean(r.product));

  const subtotalKurus = rows.reduce((sum, r) => sum + r.product.priceKurus * r.line.quantity, 0);
  const droppedCount = lines.length - rows.length;

  if (rows.length === 0) {
    return (
      <div className="page">
        <h1>Your cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className="button-primary">
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
          {rows.map(({ line, product }) => {
            const maxQuantity =
              product.fulfillmentType === "STOCKED" ? Math.max(product.stock ?? 0, 0) : 99;
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
                    value={line.quantity}
                    onChange={(e) => setQuantity(product.id, Math.max(1, Number(e.target.value) || 1))}
                  />
                </td>
                <td>{formatTRY(product.priceKurus * line.quantity)}</td>
                <td>
                  <button type="button" className="link-button" onClick={() => removeFromCart(product.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="cart-summary">
        <p>
          Subtotal: <strong>{formatTRY(subtotalKurus)}</strong>
        </p>
        <div className="cart-summary-actions">
          <button type="button" className="link-button" onClick={clearCart}>
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
