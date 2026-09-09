import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";
import type { Order, OrderStatus } from "../../lib/types";
import { formatTRY, splitDeposit } from "../../lib/money";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";

const STATUSES: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAYMENT_RECEIVED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>("PENDING_PAYMENT");
  const [paymentNote, setPaymentNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.adminOrder(id).then((o) => {
      setOrder(o);
      setStatus(o.status);
      setPaymentNote(o.paymentNote ?? "");
    });
  }, [id]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.adminUpdateOrder(id, { status, paymentNote });
      setOrder(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!order) return <p className="page-loading">Loading…</p>;

  const { depositKurus, balanceKurus } = splitDeposit(order.subtotalKurus);

  return (
    <div>
      <Link to="/admin/orders" className="back-link">
        &larr; All orders
      </Link>

      <div className="order-detail-header">
        <div>
          <h2>Order {order.orderNumber}</h2>
          <p>
            {order.user?.name} &mdash; {order.user?.email}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="order-detail-grid">
        <div>
          <h3>Items</h3>
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.productName} &times; {item.quantity}
                </span>
                <span>{formatTRY(item.lineTotalKurus)}</span>
              </li>
            ))}
          </ul>
          <div className="order-summary-total">
            <span>Total</span>
            <span>{formatTRY(order.subtotalKurus)}</span>
          </div>
          <div className="order-summary-deposit">
            <div>
              <span>Deposit expected</span>
              <span>{formatTRY(depositKurus)}</span>
            </div>
            <div>
              <span>Balance on delivery</span>
              <span>{formatTRY(balanceKurus)}</span>
            </div>
          </div>

          <h3>Delivery address</h3>
          <p>
            {order.address.fullName}
            <br />
            {order.address.addressLine}
            <br />
            {order.address.city}, {order.address.postalCode}
            <br />
            {order.address.phone}
          </p>
          <p>
            Payment method:{" "}
            {order.paymentMethod === "BANK_TRANSFER"
              ? "Bank transfer"
              : order.paymentMethod === "MPESA"
                ? "M-Pesa"
                : "Cash on delivery"}
          </p>
        </div>

        <div className="admin-form">
          <h3>Update status</h3>
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Payment note (visible to the customer)
            <textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="e.g. Received via havale, ref 12345"
            />
          </label>
          <button type="button" className="button-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <p className="success-banner">Saved.</p>}
        </div>
      </div>
    </div>
  );
}
