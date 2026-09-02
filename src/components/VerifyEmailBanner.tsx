import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

// A non-blocking nudge — the backend doesn't require a verified email to
// log in or check out (see its README), this is just a reminder.
export function VerifyEmailBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  if (!user || user.emailVerified) return null;

  async function handleResend() {
    setStatus("sending");
    try {
      await api.resendVerification();
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div className="verify-banner">
      <span>Please confirm your email address ({user!.email}) to secure your account.</span>
      {status === "sent" ? (
        <strong>Email sent — check your inbox.</strong>
      ) : (
        <button type="button" className="link-button" onClick={handleResend} disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Resend confirmation email"}
        </button>
      )}
    </div>
  );
}
