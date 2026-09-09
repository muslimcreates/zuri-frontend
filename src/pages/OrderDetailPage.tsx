import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { Order } from "../lib/types";
import { formatTRY, splitDeposit } from "../lib/money";
import { OrderStatusBadge } from "../components/OrderStatusBadge";

export function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const justPlaced = Boolean((location.state as { justPlaced?: boolean } | null)?.justPlaced);

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    api
      .myOrder(orderNumber)
      .then(setOrder)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Order not found."));
  }, [orderNumber]);

  if (error) {
    return (
      <div className="page">
        <p className="page-error">{error}</p>
        <Link to="/orders">&larr; Back to my orders</Link>
      </div>
    );
  }

  if (!order) return <p className="page-loading">Loading…</p>;

  const { depositKurus, balanceKurus } = splitDeposit(order.subtotalKurus);

  return (
    <div className="page">
      {justPlaced && (
        <p className="success-banner">
          Order placed! We'll be in touch with payment details for{" "}
          {order.paymentMethod === "BANK_TRANSFER" ? "your bank transfer" : "your M-Pesa payment"}
          {" — "}pay the {formatTRY(depositKurus)} deposit to confirm, and the remaining{" "}
          {formatTRY(balanceKurus)} is due on delivery.
        </p>
      )}

      <Link to="/orders" className="back-link">
        &larr; Back to my orders
      </Link>

      <div className="order-detail-header">
        <div>
          <h1>Order {order.orderNumber}</h1>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.paymentNote && (
        <p className="order-note">
          <strong>Note from Zuri Express:</strong> {order.paymentNote}
        </p>
      )}

      <div className="order-detail-grid">
        <div>
          <h2>Items</h2>
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
              <span>Deposit to confirm</span>
              <span>{formatTRY(depositKurus)}</span>
            </div>
            <div>
              <span>Due on delivery</span>
              <span>{formatTRY(balanceKurus)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2>Delivery address</h2>
          <p>
            {order.address.fullName}
            <br />
            {order.address.addressLine}
            <br />
            {order.address.city}, {order.address.postalCode}
            <br />
            {order.address.phone}
          </p>
          <h2>Payment</h2>
          <p>
            {order.paymentMethod === "BANK_TRANSFER"
              ? "Bank transfer (havale/EFT)"
              : order.paymentMethod === "MPESA"
                ? "M-Pesa"
                : "Cash on delivery"}
          </p>
        </div>
      </div>
    </div>
  );
}
