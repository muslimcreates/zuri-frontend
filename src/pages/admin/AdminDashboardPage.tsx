import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { DashboardStats } from "../../lib/types";
import { formatTRY } from "../../lib/money";
import { OrderStatusBadge } from "../../components/OrderStatusBadge";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.adminDashboard().then(setStats);
  }, []);

  if (!stats) return <p className="page-loading">Loading…</p>;

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.pendingOrders}</span>
          <span className="stat-label">Pending payment</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalOrders}</span>
          <span className="stat-label">Total orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.activeProducts}</span>
          <span className="stat-label">Active products</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.lowStock.length}</span>
          <span className="stat-label">Low stock (&le;3)</span>
        </div>
      </div>

      {stats.lowStock.length > 0 && (
        <section className="admin-section">
          <h2>Low stock</h2>
          <ul className="plain-list">
            {stats.lowStock.map((p) => (
              <li key={p.id}>
                {p.name} &mdash; {p.stock} left
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="admin-section">
        <h2>Recent orders</h2>
        <table className="order-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link to={`/admin/orders/${o.id}`}>{o.orderNumber}</Link>
                </td>
                <td>
                  <OrderStatusBadge status={o.status} />
                </td>
                <td>{formatTRY(o.subtotalKurus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
