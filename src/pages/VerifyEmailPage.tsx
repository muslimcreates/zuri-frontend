import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<"verifying" | "done" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing verification token.");
      return;
    }
    api
      .verifyEmail(token)
      .then(() => {
        setStatus("done");
        refreshUser();
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Verification failed.");
      });
  }, [token, refreshUser]);

  return (
    <div className="page auth-page">
      <h1>Email verification</h1>
      {status === "verifying" && <p>Confirming your email…</p>}
      {status === "done" && <p className="success-banner">Your email is confirmed. Thanks!</p>}
      {status === "error" && (
        <>
          <p className="page-error">{error}</p>
          <p>
            You can request a fresh link from your account once logged in, or continue shopping in
            the meantime.
          </p>
        </>
      )}
      <Link to="/" className="button-primary">
        Continue to shop
      </Link>
    </div>
  );
}
