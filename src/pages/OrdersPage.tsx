import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Order } from "../lib/types";
import { formatTRY } from "../lib/money";
import { OrderStatusBadge } from "../components/OrderStatusBadge";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.myOrders().then(setOrders);
  }, []);

  if (!orders) return <p className="page-loading">Loading your orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="page">
        <h1>My orders</h1>
        <p>You haven't placed any orders yet.</p>
        <Link to="/shop" className="button-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My orders</h1>
      <table className="order-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link to={`/orders/${o.orderNumber}`}>{o.orderNumber}</Link>
              </td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>
                <OrderStatusBadge status={o.status} />
              </td>
              <td>{formatTRY(o.subtotalKurus)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
