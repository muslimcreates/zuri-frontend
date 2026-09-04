import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Logo } from "./Logo";

export function Navbar() {
  const { user, welcomeKind, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  // The admin account manages the store, it doesn't shop in it — showing
  // Shop/My Orders/Cart on top of the admin dashboard was just customer UI
  // that had no purpose there. Give admins only what's theirs.
  const isAdmin = user?.role === "ADMIN";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? "/admin" : "/"} className="brand">
          <Logo size={36} withWordmark />
        </Link>

        <nav className="navbar-links">
          {!isAdmin && (
            <>
              <Link to="/shop">Shop</Link>
              {/* Cart (and Orders) only make sense once there's an account
                  behind them — /cart is a ProtectedRoute anyway so a
                  signed-out visitor clicking it would just get bounced to
                  /login, but showing it at all before that point is
                  confusing UI for no benefit, so it's gated on `user` the
                  same way "My Orders" already is. */}
              {user && (
                <>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/cart" className="cart-link">
                    Cart
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                  </Link>
                </>
              )}
            </>
          )}
          {isAdmin && <Link to="/admin">Admin dashboard</Link>}

          {user ? (
            <div className="navbar-user">
              <span>
                {welcomeKind === "new" ? "Welcome" : "Welcome back"}, {user.name}!
              </span>
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
