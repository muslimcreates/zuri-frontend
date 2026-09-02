import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-name">Zuri Express</span>
          <span className="brand-tagline">For Kenyans, By Kenyans</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Shop</Link>
          {user && <Link to="/orders">My Orders</Link>}
          {user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
          <Link to="/cart" className="cart-link">
            Cart
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {user ? (
            <div className="navbar-user">
              <span>{user.name}</span>
              <button type="button" className="link-button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : (
            <div className="navbar-user">
              <Link to="/login">Log in</Link>
              <Link to="/signup" className="button-link">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
