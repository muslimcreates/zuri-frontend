import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { GoogleButton } from "../components/GoogleButton";
import type { User } from "../lib/types";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // If we landed here because ProtectedRoute/AdminRoute bounced someone off
  // a specific page, honor that and send them back to exactly it. Otherwise
  // there's no single "right" default — an admin logging in from a bare
  // /login visit should land on /admin, not the customer shop — so fall
  // back to a role-based destination once we know who actually logged in.
  const fromPath = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const destinationFor = (user: User) => fromPath ?? (user.role === "ADMIN" ? "/admin" : "/shop");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const me = await login(email, password);
      navigate(destinationFor(me), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't log in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <h1>Log in</h1>

      <GoogleButton onSuccess={(me) => navigate(destinationFor(me), { replace: true })} />
      <div className="auth-divider">or</div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
