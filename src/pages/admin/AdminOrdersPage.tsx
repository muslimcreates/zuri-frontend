import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { Order } from "../../lib/types";
import { formatTRY } from "../../lib/money";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.adminOrders().then(setOrders);
  }, []);

  if (!orders) return <p className="page-loading">Loading…</p>;

  return (
    <table className="order-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td>
              <Link to={`/admin/orders/${o.id}`}>{o.orderNumber}</Link>
            </td>
            <td>
              {o.user?.name} <span className="muted">({o.user?.email})</span>
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
  );
}
