import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Product } from "../lib/types";
import { formatTRY } from "../lib/money";
import { Logo } from "../components/Logo";

// Public marketing page, shown at "/" to signed-out and signed-in visitors
// alike. Deliberately says nothing about how fulfillment actually works
// (some items stocked here, some imported per order) — that's internal.
// Clicking a product below sends the visitor to /products/:slug, which is a
// ProtectedRoute — so it naturally prompts sign up / log in, then lands them
// back on that exact product, with no extra click-interception code needed.
export function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .products()
      .then((all) => setProducts(all.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing">
      <section className="landing-hero">
        <Logo size={72} />
        <h1>Looking for Kenyan products in Türkiye?</h1>
        <p className="landing-hero-sub">
          Look no further — Zuri Express has brought it to your doorstep.
        </p>
        <p className="landing-hero-body">
          From your favourite grocery staples to spices, snacks and fabric, we bring the taste and
          feel of home to Kenyans living across Türkiye. Browse the store, order in a few taps, and
          have it delivered to you.
        </p>
        <div className="landing-hero-actions">
          <Link to="/shop" className="button-primary button-large">
            Shop now
          </Link>
          <Link to="/signup" className="button-secondary button-large">
            Create a free account
          </Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-feature">
          <h3>Authentically Kenyan</h3>
          <p>Curated groceries, spices, snacks and fabric that taste and feel like home.</p>
        </div>
        <div className="landing-feature">
          <h3>Delivered across Türkiye</h3>
          <p>Order from wherever you are and have it sent straight to your door.</p>
        </div>
        <div className="landing-feature">
          <h3>Simple, secure ordering</h3>
          <p>Create an account, add to cart, and check out in just a few steps.</p>
        </div>
      </section>

      <section className="landing-products">
        <h2>A taste of what's in store</h2>
        {loading && <p className="page-loading">Loading products…</p>}
        {!loading && products.length === 0 && (
          <p className="landing-products-empty">New products are being added — check back soon.</p>
        )}
        <div className="landing-product-grid">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.slug}`} className="landing-product-card">
              <div className="landing-product-image">
                <img src={p.imageUrl} alt={p.name} loading="lazy" />
              </div>
              <div className="landing-product-body">
                <p className="product-card-category">{p.category.name}</p>
                <h3>{p.name}</h3>
                <p className="product-card-price">{formatTRY(p.priceKurus)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2>Ready to shop?</h2>
        <p>Sign up in seconds and get your Kenyan favourites on the way.</p>
        <div className="landing-hero-actions">
          <Link to="/signup" className="button-primary button-large">
            Create a free account
          </Link>
          <Link to="/login" className="button-secondary button-large">
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}
