import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Product } from "../lib/types";
import { formatTRY } from "../lib/money";
import { Logo } from "../components/Logo";
import { Reveal } from "../components/Reveal";

// Trust signals shown between the hero and the feature grid. Deliberately
// real, verifiable things about how the store actually operates — not
// invented customer counts or star ratings, which would be misleading for
// a store this new. See README "Data model notes" for the fulfillment and
// manual-payment details these paraphrase.
const TRUST_POINTS = [
  { icon: "🇰🇪", text: "Run by Kenyans, for Kenyans in Türkiye" },
  { icon: "🧾", text: "Every order is checked by a real person before it ships — never fully automated" },
  { icon: "📦", text: "Some items ready to ship locally, others brought over fresh, order by order" },
  { icon: "💬", text: "A small team — reach us directly, no call centre" },
];

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
      <section className="landing-hero landing-hero-animated">
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

      <section className="landing-trust">
        <ul className="landing-trust-list">
          {TRUST_POINTS.map((point, i) => (
            <Reveal key={point.text} as="li" delay={i * 90} className="landing-trust-item">
              <span className="landing-trust-icon" aria-hidden="true">
                {point.icon}
              </span>
              <span>{point.text}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="landing-features">
        {[
          { title: "Authentically Kenyan", body: "Curated groceries, spices, snacks and fabric that taste and feel like home." },
          { title: "Delivered across Türkiye", body: "Order from wherever you are and have it sent straight to your door." },
          { title: "Simple, secure ordering", body: "Create an account, add to cart, and check out in just a few steps." },
        ].map((f, i) => (
          <Reveal key={f.title} delay={i * 100} className="landing-feature">
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </Reveal>
        ))}
      </section>

      <section className="landing-products">
        <h2>A taste of what's in store</h2>
        {loading && <p className="page-loading">Loading products…</p>}
        {!loading && products.length === 0 && (
          <p className="landing-products-empty">New products are being added — check back soon.</p>
        )}
        <div className="landing-product-grid">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 6) * 60} className="landing-product-card-wrap">
              <Link to={`/products/${p.slug}`} className="landing-product-card">
                <div className="landing-product-image">
                  <img src={p.imageUrl} alt={p.name} loading="lazy" />
                </div>
                <div className="landing-product-body">
                  <p className="product-card-category">{p.category.name}</p>
                  <h3>{p.name}</h3>
                  <p className="product-card-price">{formatTRY(p.priceKurus)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal as="div" className="landing-cta">
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
      </Reveal>
    </div>
  );
}
