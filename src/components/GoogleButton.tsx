import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import type { User } from "../lib/types";

// Google Identity Services: a small script from Google renders the actual
// button and, when clicked, hands us back a signed ID token (JWT) — no
// OAuth redirect dance needed. We forward that token to
// POST /api/auth/google, which verifies it server-side. See the backend
// README "Setting up Google Sign-In" for how to get a Client ID.

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In script."));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

export function GoogleButton({ onSuccess }: { onSuccess: (user: User) => void }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || clientId.includes("your-client-id")) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const me = await loginWithGoogle(response.credential);
              // loginWithGoogle only updates who's logged in (AuthContext) —
              // it doesn't navigate anywhere on its own, same as the
              // email/password form below. Without this, the navbar shows
              // you're logged in but you're stuck looking at this same page.
              // Pass the user back so the caller can route by role (e.g. an
              // admin lands on /admin instead of /shop).
              onSuccess(me);
            } catch (err) {
              setError(err instanceof ApiError ? err.message : "Google sign-in failed.");
            }
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
        });
      })
      .catch(() => setError("Couldn't load Google Sign-In. Check your internet connection."));

    return () => {
      cancelled = true;
    };
  }, [clientId, loginWithGoogle, onSuccess]);

  if (!clientId || clientId.includes("your-client-id")) {
    return (
      <p className="google-button-placeholder">
        Google Sign-In isn't configured yet — set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>.env</code>.
      </p>
    );
  }

  return (
    <div>
      <div ref={buttonRef} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
