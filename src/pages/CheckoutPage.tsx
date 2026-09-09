import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { ManualPaymentMethod } from "../lib/types";
import { formatTRY, splitDeposit } from "../lib/money";
import { useCart } from "../context/CartContext";

const PAYMENT_METHODS: { value: ManualPaymentMethod; label: string; hint: string }[] = [
  {
    value: "BANK_TRANSFER",
    label: "Bank transfer (havale/EFT)",
    hint: "We'll email you our IBAN details. Pay the deposit below to confirm — the rest is due on delivery.",
  },
  {
    value: "MPESA",
    label: "M-Pesa",
    hint: "We'll email you the M-Pesa till/paybill details. Pay the deposit below to confirm — the rest is due on delivery.",
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
  // Whether a saved default address was found and used to prefill the form
  // below — drives both the "we filled this in for you" note and the
  // default state of the "save as default" checkbox (checked when there's
  // nothing saved yet, since that's almost certainly what a first-time
  // buyer wants; left as a plain, unchecked opt-in once something's already
  // saved, so re-typing a one-off delivery address doesn't silently
  // overwrite it).
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    api
      .defaultAddress()
      .then((addr) => {
        if (!addr) return;
        setFullName(addr.fullName);
        setPhone(addr.phone);
        setCity(addr.city);
        setAddressLine(addr.addressLine);
        setPostalCode(addr.postalCode);
        setHasSavedAddress(true);
        setSaveAsDefault(false);
      })
      .catch(() => {});
  }, []);

  // Same reasoning as CartPage — a product can go inactive after it was
  // added to the cart; the order is placed from whatever the server's
  // cart actually resolves to active products, so keep this in sync with
  // what checkout will really charge for.
  const rows = items.filter((i) => i.product.active);
  const subtotalKurus = rows.reduce((sum, r) => sum + r.product.priceKurus * r.quantity, 0);
  const { depositKurus, balanceKurus } = splitDeposit(subtotalKurus);

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
        saveAsDefault,
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
          {hasSavedAddress && (
            <p className="checkout-note">
              Filled in from your saved address — edit it below for this order only, or update it for good in{" "}
              <Link to="/settings">Settings</Link>.
            </p>
          )}
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
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
            />
            Save this as my default delivery address
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
            Pay half now to confirm your order — the rest is due on delivery. We'll confirm your
            order by hand once your deposit arrives.
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
          <div className="order-summary-deposit">
            <div>
              <span>Pay now (50% deposit)</span>
              <span>{formatTRY(depositKurus)}</span>
            </div>
            <div>
              <span>Due on delivery</span>
              <span>{formatTRY(balanceKurus)}</span>
            </div>
          </div>
          <button type="submit" className="button-primary" disabled={submitting}>
            {submitting ? "Placing order…" : `Place order — pay ${formatTRY(depositKurus)} now`}
          </button>
        </div>
      </form>
    </div>
  );
}
