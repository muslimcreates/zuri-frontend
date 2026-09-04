import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// Handles both ways someone can confirm their email: clicking the link in
// the email (?token=... in the URL, auto-submitted on mount below) or
// typing in the 6-digit code from the same email. Either one flips the
// account to verified — see the backend's routes/auth.ts for both routes.
// Verification is required to use the cart or check out (ProtectedRoute
// sends signed-in-but-unverified users here), so on success we send people
// on to wherever they were originally headed.
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/shop";

  const [linkStatus, setLinkStatus] = useState<"idle" | "verifying" | "done" | "error">("idle");
  const [linkError, setLinkError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [codeError, setCodeError] = useState<string | null>(null);

  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    if (!token) return;
    setLinkStatus("verifying");
    api
      .verifyEmail(token)
      .then(async () => {
        setLinkStatus("done");
        await refreshUser();
        navigate(from, { replace: true });
      })
      .catch((err) => {
        setLinkStatus("error");
        setLinkError(err instanceof ApiError ? err.message : "Verification failed.");
      });
    // Only ever want this to run once, for the token present when the page loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSubmitCode(e: FormEvent) {
    e.preventDefault();
    setCodeStatus("submitting");
    setCodeError(null);
    try {
      await api.verifyEmailCode(code.trim());
      await refreshUser();
      navigate(from, { replace: true });
    } catch (err) {
      setCodeStatus("idle");
      setCodeError(err instanceof ApiError ? err.message : "That code didn't work. Please try again.");
    }
  }

  async function handleResend() {
    setResendStatus("sending");
    try {
      await api.resendVerification();
      setResendStatus("sent");
    } catch {
      setResendStatus("idle");
    }
  }

  if (user?.emailVerified) {
    return (
      <div className="page auth-page">
        <h1>Email verification</h1>
        <p className="success-banner">Your email is already confirmed — you're all set.</p>
        <Link to="/shop" className="button-primary">
          Continue to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <h1>Confirm your email</h1>
      <p>
        We sent a message to <strong>{user?.email}</strong> with a 6-digit code and a confirmation
        link — either one works, and you'll need one of them before you can shop.
      </p>

      {token && linkStatus === "verifying" && <p>Confirming your email…</p>}
      {token && linkStatus === "error" && <p className="page-error">{linkError}</p>}

      <form className="auth-form" onSubmit={handleSubmitCode}>
        <label htmlFor="verify-code">6-digit code</label>
        <input
          id="verify-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          required
        />
        {codeError && <p className="field-error">{codeError}</p>}
        <button type="submit" className="button-primary" disabled={codeStatus === "submitting" || code.length < 6}>
          {codeStatus === "submitting" ? "Confirming…" : "Confirm code"}
        </button>
      </form>

      <p>
        Didn't get it?{" "}
        {resendStatus === "sent" ? (
          <strong>Email sent — check your inbox.</strong>
        ) : (
          <button
            type="button"
            className="link-button"
            onClick={handleResend}
            disabled={resendStatus === "sending"}
          >
            {resendStatus === "sending" ? "Sending…" : "Resend the code and link"}
          </button>
        )}
      </p>
    </div>
  );
}
