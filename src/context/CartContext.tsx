import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type { CartItem } from "../lib/types";
import { useAuth } from "./AuthContext";

// The cart is stored server-side, per user (see the backend's
// src/lib/cart.ts) — this context is just a thin, reactive cache of it.
// Every mutation calls the API and replaces `items` with whatever the
// server says the cart now contains, so there's never a local copy that
// can drift from the database or leak between users. It only loads/holds
// anything once someone is signed in — the shop, product pages, and the
// cart itself are all behind login (see App.tsx), so there's no
// meaningful "guest cart" case to handle.

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  quantityOf: (productId: string) => number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  // The admin account manages the store, it doesn't shop in it (the navbar
  // doesn't even show a cart link for admins — see Navbar.tsx), so there's
  // no reason to create/fetch a cart for that account at all.
  const skipCart = user?.role === "ADMIN";

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload the cart whenever the signed-in user changes — login, logout,
  // or switching accounts on the same browser — so it's always exactly
  // this user's own cart, never whoever was signed in a moment ago.
  useEffect(() => {
    if (authLoading) return;
    if (!userId || skipCart) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .cart()
      .then((cart) => {
        if (!cancelled) setItems(cart);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, authLoading, skipCart]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    const next = await api.addCartItem(productId, quantity);
    setItems(next);
  }, []);

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    const next = await api.setCartItemQuantity(productId, quantity);
    setItems(next);
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    const next = await api.removeCartItem(productId);
    setItems(next);
  }, []);

  const clearCart = useCallback(async () => {
    const next = await api.clearCart();
    setItems(next);
  }, []);

  const quantityOf = useCallback(
    (productId: string) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, loading, itemCount, quantityOf, addToCart, setQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
