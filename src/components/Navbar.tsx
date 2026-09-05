import { useState } from "react";
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

  // Everything below the logo — links, cart, welcome message, log out —
  // collapses behind a hamburger button on small screens (see the
  // `.navbar-links`/`.navbar-hamburger` rules in global.css) so a phone
  // screen isn't left trying to cram all of it into one row. `menuOpen`
  // only matters visually below that breakpoint; on desktop the CSS keeps
  // `.navbar-links` shown regardless of this state.
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  async function handleLogout() {
    closeMenu();
    await logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={isAdmin ? "/admin" : "/"} className="brand" onClick={closeMenu}>
          <Logo size={36} withWordmark />
        </Link>

        <button
          type="button"
          className="navbar-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links${menuOpen ? " navbar-links-open" : ""}`}>
          {!isAdmin && (
            <>
              <Link to="/shop" onClick={closeMenu}>
                Shop
              </Link>
              {/* Cart (and Orders/Settings) only make sense once there's an
                  account behind them — each is a ProtectedRoute anyway so a
                  signed-out visitor clicking one would just get bounced to
                  /login, but showing them at all before that point is
                  confusing UI for no benefit. */}
              {user && (
                <>
                  <Link to="/orders" onClick={closeMenu}>
                    My Orders
                  </Link>
                  <Link to="/settings" onClick={closeMenu}>
                    Settings
                  </Link>
                  <Link to="/cart" className="cart-link" onClick={closeMenu}>
                    Cart
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                  </Link>
                </>
              )}
            </>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={closeMenu}>
              Admin dashboard
            </Link>
          )}

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
              <Link to="/login" onClick={closeMenu}>
                Log in
              </Link>
              <Link to="/signup" className="button-link" onClick={closeMenu}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
