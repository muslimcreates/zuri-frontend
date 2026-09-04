import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { ManualPaymentMethod } from "../lib/types";
import { formatTRY } from "../lib/money";
import { useCart } from "../context/CartContext";

const PAYMENT_METHODS: { value: ManualPaymentMethod; label: string; hint: string }[] = [
  {
    value: "BANK_TRANSFER",
    label: "Bank transfer (havale/EFT)",
    hint: "We'll email you our IBAN details. Your order ships once payment is confirmed.",
  },
  {
    value: "CASH_ON_DELIVERY",
    label: "Cash on delivery",
    hint: "Pay in cash when your order arrives.",
  },
];

export function CheckoutPage() {
  const { items, loading: cartLoading, clearCart } = useCart();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>("BANK_TRANSFER");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Same reasoning as CartPage — a product can go inactive after it was
  // added to the cart; the order is placed from whatever the server's
  // cart actually resolves to active products, so keep this in sync with
  // what checkout will really charge for.
  const rows = items.filter((i) => i.product.active);
  const subtotalKurus = rows.reduce((sum, r) => sum + r.product.priceKurus * r.quantity, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      // The server places the order from the caller's own cart — it's not
      // sent in this request at all (see the backend's POST /api/orders).
      const order = await api.checkout({
        address: { fullName, phone, city, addressLine, postalCode },
        paymentMethod,
      });
      // The server already clears the cart once the order is created;
      // this just syncs that into the local cache so the navbar badge
      // and any other open view update immediately.
      clearCart().catch(() => {});
      navigate(`/orders/${order.orderNumber}`, { state: { justPlaced: true } });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fields ?? {});
      } else {
        setError("Something went wrong placing your order.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (cartLoading) return <p className="page-loading">Loading…</p>;

  if (rows.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="page checkout-page">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout-grid">
        <div className="checkout-form">
          <h2>Delivery address</h2>
          <label>
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName[0]}</span>}
          </label>
          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" required />
            {fieldErrors.phone && <span className="field-error">{fieldErrors.phone[0]}</span>}
          </label>
          <label>
            City
            <input value={city} onChange={(e) => setCity(e.target.value)} required />
            {fieldErrors.city && <span className="field-error">{fieldErrors.city[0]}</span>}
          </label>
          <label>
            Address
            <textarea value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
            {fieldErrors.addressLine && <span className="field-error">{fieldErrors.addressLine[0]}</span>}
          </label>
          <label>
            Postal code
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
            {fieldErrors.postalCode && <span className="field-error">{fieldErrors.postalCode[0]}</span>}
          </label>

          <h2>Payment</h2>
          <div className="payment-options">
            {PAYMENT_METHODS.map((m) => (
              <label key={m.value} className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.value}
                  checked={paymentMethod === m.value}
                  onChange={() => setPaymentMethod(m.value)}
                />
                <div>
                  <strong>{m.label}</strong>
                  <p>{m.hint}</p>
                </div>
              </label>
            ))}
          </div>
          <p className="checkout-note">
            No card payments yet — Zuri Express doesn't have a registered Turkish company, so
            checkout is manual for now. We'll confirm your order by hand once payment arrives.
          </p>

          {error && <p className="page-error">{error}</p>}
        </div>

        <div className="order-summary">
          <h2>Order summary</h2>
          <ul>
            {rows.map(({ product, quantity }) => (
              <li key={product.id}>
                <span>
                  {product.name} &times; {quantity}
                </span>
                <span>{formatTRY(product.priceKurus * quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="order-summary-total">
            <span>Total</span>
            <span>{formatTRY(subtotalKurus)}</span>
          </div>
          <button type="submit" className="button-primary" disabled={submitting}>
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}
