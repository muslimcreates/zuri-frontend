import { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../lib/types";
import { formatTRY } from "../lib/money";
import { useCart } from "../context/CartContext";
import { ApiError } from "../lib/api";

// Compact, dense card (many products visible at once, Trendyol-style browsing)
// with a quick-add button so someone can add to cart straight from the grid —
// no detour through the product page for the common case of "yes, that one,
// one of it". Clicking the button itself must never trigger the card's own
// <Link> navigation, hence stopPropagation/preventDefault below.
export function ProductCard({ product }: { product: Product }) {
  const { addToCart, quantityOf } = useCart();
  const inCart = quantityOf(product.id);

  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status === "adding") return;
    setStatus("adding");
    setErrorMessage(null);
    try {
      await addToCart(product.id, 1);
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof ApiError ? err.message : "Couldn't add — try again.");
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage(null);
      }, 2500);
    }
  }

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.fulfillmentType === "ON_REQUEST" && (
          <span className="badge badge-preorder">Made to order</span>
        )}
        <button
          type="button"
          className={`quick-add-btn quick-add-${status}`}
          onClick={handleQuickAdd}
          disabled={status === "adding"}
          aria-label={`Add ${product.name} to cart`}
          title={`Add ${product.name} to cart`}
        >
          {status === "added" ? "✓" : status === "error" ? "!" : "+"}
        </button>
        {inCart > 0 && <span className="badge badge-in-cart">{inCart} in cart</span>}
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{product.category.name}</p>
        <h3>{product.name}</h3>
        <p className="product-card-price">{formatTRY(product.priceKurus)}</p>
        {status === "error" && errorMessage && <p className="product-card-quick-error">{errorMessage}</p>}
      </div>
    </Link>
  );
}
