import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { Product } from "../lib/types";
import { formatTRY } from "../lib/money";
import { useCart } from "../context/CartContext";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setError(null);
    setProduct(null);
    api
      .product(slug)
      .then(setProduct)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Product not found."));
  }, [slug]);

  if (error) {
    return (
      <div className="page">
        <p className="page-error">{error}</p>
        <Link to="/shop">&larr; Back to shop</Link>
      </div>
    );
  }

  if (!product) return <p className="page-loading">Loading…</p>;

  const outOfStock = product.fulfillmentType === "STOCKED" && (product.stock ?? 0) <= 0;
  const maxQuantity = product.fulfillmentType === "STOCKED" ? Math.max(product.stock ?? 0, 0) : 99;

  async function handleAddToCart() {
    setAddError(null);
    try {
      await addToCart(product!.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      return true;
    } catch {
      setAddError("Couldn't add that to your cart. Please try again.");
      return false;
    }
  }

  return (
    <div className="page product-detail">
      <Link to="/shop" className="back-link">
        &larr; Back to shop
      </Link>

      <div className="product-detail-grid">
        <img src={product.imageUrl} alt={product.name} className="product-detail-image" />

        <div>
          <p className="product-card-category">{product.category.name}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-price">{formatTRY(product.priceKurus)}</p>
          <p className="product-detail-description">{product.description}</p>

          {product.fulfillmentType === "STOCKED" ? (
            <p className="fulfillment-note">
              {outOfStock ? "Currently out of stock." : `${product.stock} in stock, ready to ship.`}
            </p>
          ) : (
            <p className="fulfillment-note">
              Made to order — ships in about {product.leadTimeDays} days.
            </p>
          )}

          {!outOfStock && (
            <div className="add-to-cart-row">
              <input
                type="number"
                min={1}
                max={maxQuantity || undefined}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <button type="button" className="button-primary" onClick={handleAddToCart}>
                {added ? "Added ✓" : "Add to cart"}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={async () => {
                  if (await handleAddToCart()) navigate("/cart");
                }}
              >
                Buy now
              </button>
            </div>
          )}
          {addError && <p className="field-error">{addError}</p>}
        </div>
      </div>
    </div>
  );
}
