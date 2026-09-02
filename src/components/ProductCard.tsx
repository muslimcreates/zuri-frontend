import { Link } from "react-router-dom";
import type { Product } from "../lib/types";
import { formatTRY } from "../lib/money";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.fulfillmentType === "STOCKED" && (product.stock ?? 0) <= 0;

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card-image">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {outOfStock && <span className="badge badge-out">Out of stock</span>}
        {!outOfStock && product.fulfillmentType === "ON_REQUEST" && (
          <span className="badge badge-preorder">Imported to order</span>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{product.category.name}</p>
        <h3>{product.name}</h3>
        <p className="product-card-price">{formatTRY(product.priceKurus)}</p>
        {product.fulfillmentType === "ON_REQUEST" && product.leadTimeDays && (
          <p className="product-card-lead-time">~{product.leadTimeDays} days from Kenya</p>
        )}
      </div>
    </Link>
  );
}
