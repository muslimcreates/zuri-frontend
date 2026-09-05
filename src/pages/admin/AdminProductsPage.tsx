import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { Product } from "../../lib/types";
import { formatTRY } from "../../lib/money";

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null);

  function load() {
    api.adminProducts().then(setProducts);
  }

  useEffect(load, []);

  async function handleToggleActive(product: Product) {
    if (product.active) {
      if (!confirm(`Hide "${product.name}" from the shop?`)) return;
      await api.adminHideProduct(product.id);
    } else {
      await api.adminUpdateProduct(product.id, {
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        priceTRY: product.priceKurus / 100,
        categoryId: product.categoryId,
        fulfillmentType: product.fulfillmentType,
        stock: product.stock ?? undefined,
        leadTimeDays: product.leadTimeDays ?? undefined,
        active: true,
      });
    }
    load();
  }

  if (!products) return <p className="page-loading">Loading…</p>;

  return (
    <div>
      <div className="admin-toolbar">
        <Link to="/admin/products/new" className="button-primary">
          + New product
        </Link>
      </div>
      <div className="table-scroll">
        <table className="order-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Fulfillment</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category.name}</td>
                <td>{formatTRY(p.priceKurus)}</td>
                <td>
                  {p.fulfillmentType === "STOCKED" ? `${p.stock ?? 0} in stock` : `~${p.leadTimeDays}d lead time`}
                </td>
                <td>{p.active ? "Active" : "Hidden"}</td>
                <td className="admin-row-actions">
                  <Link to={`/admin/products/${p.id}`}>Edit</Link>
                  <button type="button" className="link-button" onClick={() => handleToggleActive(p)}>
                    {p.active ? "Hide" : "Unhide"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
