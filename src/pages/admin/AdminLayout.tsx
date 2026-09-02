import { NavLink, Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="page admin-page">
      <h1>Admin</h1>
      <nav className="admin-tabs">
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
