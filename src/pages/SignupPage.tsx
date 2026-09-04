import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { GoogleButton } from "../components/GoogleButton";
import type { User } from "../lib/types";

// Signing up with a password always creates a CUSTOMER account, but the
// Google button here can still resolve to an existing account (see
// POST /api/auth/google — it links/logs into a matching email rather than
// always creating a new one), which could be an admin's. Route by role
// either way so that isn't a dead end.
function destinationFor(user: User) {
  return user.role === "ADMIN" ? "/admin" : "/shop";
}

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const me = await signup(name, email, password, agreeToTerms);
      navigate(destinationFor(me), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fields ?? {});
      } else {
        setError("Couldn't create your account.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <h1>Create an account</h1>

      <GoogleButton onSuccess={(me) => navigate(destinationFor(me), { replace: true })} />
      <p className="auth-terms-notice">
        By continuing with Google, you agree to our{" "}
        <Link to="/terms" target="_blank" rel="noopener noreferrer">
          Terms &amp; Conditions
        </Link>
        , including receiving occasional emails from Zuri Express.
      </p>
      <div className="auth-divider">or</div>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name[0]}</span>}
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email[0]}</span>}
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password[0]}</span>}
        </label>
        <label className="auth-terms-checkbox">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            required
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">
              Terms &amp; Conditions
            </Link>
            , including receiving occasional emails from Zuri Express.
          </span>
          {fieldErrors.agreeToTerms && <span className="field-error">{fieldErrors.agreeToTerms[0]}</span>}
        </label>
        {error && !Object.keys(fieldErrors).length && <p className="field-error">{error}</p>}
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
