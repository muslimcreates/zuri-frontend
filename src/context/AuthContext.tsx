import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type { User } from "../lib/types";

// "new" -> just created this account (fresh signup, or a Google sign-in
// that created one) -> Navbar greets with "Welcome". "returning" -> every
// other case (password login, a Google sign-in that matched an existing
// account, or a session restored from an existing cookie on page load) ->
// "Welcome back". See Navbar.tsx.
type WelcomeKind = "new" | "returning";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  welcomeKind: WelcomeKind | null;
  // Each of these returns the just-logged-in user (not just void) so a
  // caller can decide where to navigate — e.g. straight to /admin for an
  // admin — without waiting on a re-render to see the updated `user` above.
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, agreeToTerms: boolean) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [welcomeKind, setWelcomeKind] = useState<WelcomeKind | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
      // Only fills in a default the first time we discover a signed-in user
      // (e.g. an existing session cookie on page load) — leaves it alone if
      // login/signup/loginWithGoogle already set something more specific
      // this session (this also runs after VerifyEmailPage calls
      // refreshUser(), where we want to keep whatever signup/loginWithGoogle
      // already decided rather than resetting it).
      setWelcomeKind((prev) => prev ?? "returning");
    } catch {
      setUser(null);
      setWelcomeKind(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const me = await api.login({ email, password });
    setUser(me);
    setWelcomeKind("returning"); // logging in only ever hits an existing account
    return me;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, agreeToTerms: boolean) => {
    const me = await api.signup({ name, email, password, agreeToTerms });
    setUser(me);
    setWelcomeKind("new"); // signing up only ever creates a new account
    return me;
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const { isNewUser, ...me } = await api.loginWithGoogle(credential);
    setUser(me);
    setWelcomeKind(isNewUser ? "new" : "returning");
    return me;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setWelcomeKind(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, welcomeKind, login, signup, loginWithGoogle, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
