import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Category, Product } from "../lib/types";
import { ProductCard } from "../components/ProductCard";

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .products(activeCategory || undefined)
      .then(setProducts)
      .catch(() => setError("Couldn't load products. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="page">
      <section className="hero">
        <h1>Kenyan merchandise, delivered in Türkiye</h1>
        <p>Groceries, spices, fabric and more — some in stock locally, some imported per order.</p>
      </section>

      <div className="category-filters">
        <button
          type="button"
          className={activeCategory === "" ? "chip chip-active" : "chip"}
          onClick={() => setSearchParams({})}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={activeCategory === c.slug ? "chip chip-active" : "chip"}
            onClick={() => setSearchParams({ category: c.slug })}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading && <p className="page-loading">Loading products…</p>}
      {error && <p className="page-error">{error}</p>}
      {!loading && !error && products.length === 0 && <p>No products in this category yet.</p>}

      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
