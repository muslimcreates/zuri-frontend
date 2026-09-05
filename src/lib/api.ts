import type {
  Address,
  CartItem,
  Category,
  DashboardStats,
  ManualPaymentMethod,
  Order,
  Product,
  User,
} from "./types";

// In production we always call our own domain (zuriexpress.com/api/...) and
// let Netlify's proxy rule (see public/_redirects) forward that to the
// Render backend server-side. That keeps every request same-origin from the
// browser's perspective, which is what makes the login cookie behave as a
// first-party cookie instead of a cross-site one — see src/lib/session.ts
// on the backend for the other half of this. VITE_API_URL is only used for
// local development, where the frontend and backend run on different ports
// on localhost; there's deliberately no way to point production at a
// different API host by env var anymore, since that's exactly the kind of
// setting that's easy to forget to update (it broke login once already,
// when the frontend moved to a custom domain and CLIENT_ORIGIN on the
// backend wasn't updated to match).
const API_URL = import.meta.env.PROD ? "" : import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// Thrown for any non-2xx response. `fields` is set for Zod validation
// errors (400s from the backend's error middleware), keyed by field name —
// see zuri-express-backend/src/middleware/errorHandler.ts.
export class ApiError extends Error {
  status: number;
  fields?: Record<string, string[]>;
  constructor(status: number, message: string, fields?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include", // send/receive the httpOnly session cookie
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? "Something went wrong.", body.fields);
  }
  return body as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined });
const put = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: "PUT", body: JSON.stringify(data) });
const patch = <T>(path: string, data?: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(data) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

export const api = {
  // Auth
  signup: (data: { name: string; email: string; password: string; agreeToTerms: boolean }) =>
    post<User>("/api/auth/signup", data),
  login: (data: { email: string; password: string }) => post<User>("/api/auth/login", data),
  // isNewUser distinguishes "just created this account" from "logged into
  // or linked onto an existing one" — email/password login and signup don't
  // need this (login only ever hits an existing account, signup only ever
  // creates one), but Google can go either way depending on whether that
  // email was already registered. See routes/auth.ts's /google route.
  loginWithGoogle: (credential: string) =>
    post<User & { isNewUser: boolean }>("/api/auth/google", { credential }),
  logout: () => post<void>("/api/auth/logout"),
  me: () => get<User>("/api/auth/me"),
  verifyEmail: (token: string) =>
    get<{ verified: true }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),
  verifyEmailCode: (code: string) => post<{ verified: true }>("/api/auth/verify-email-code", { code }),
  resendVerification: () => post<{ sent?: true; alreadyVerified?: true }>("/api/auth/resend-verification"),
  updateProfile: (data: { name: string }) => patch<User>("/api/auth/me", data),

  // Saved delivery address, managed from /settings — see the backend's
  // src/routes/addresses.ts. Separate from the address snapshot every order
  // carries (Order.address), which never changes after the fact.
  defaultAddress: () => get<Address | null>("/api/addresses/default"),
  saveDefaultAddress: (address: AddressInput) => put<Address>("/api/addresses/default", address),

  // Catalog
  categories: () => get<Category[]>("/api/categories"),
  products: (categorySlug?: string) =>
    get<Product[]>(`/api/products${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ""}`),
  product: (slug: string) => get<Product>(`/api/products/${encodeURIComponent(slug)}`),

  // Cart — stored server-side, per user (see the backend's src/lib/cart.ts).
  // Every one of these returns the cart's full, current item list.
  cart: () => get<CartItem[]>("/api/cart"),
  addCartItem: (productId: string, quantity = 1) =>
    post<CartItem[]>("/api/cart/items", { productId, quantity }),
  setCartItemQuantity: (productId: string, quantity: number) =>
    put<CartItem[]>(`/api/cart/items/${encodeURIComponent(productId)}`, { quantity }),
  removeCartItem: (productId: string) =>
    del<CartItem[]>(`/api/cart/items/${encodeURIComponent(productId)}`),
  clearCart: () => del<CartItem[]>("/api/cart"),

  // Orders
  checkout: (data: { address: AddressInput; paymentMethod: ManualPaymentMethod; saveAsDefault?: boolean }) =>
    post<Order>("/api/orders", data),
  myOrders: () => get<Order[]>("/api/orders"),
  myOrder: (orderNumber: string) => get<Order>(`/api/orders/${encodeURIComponent(orderNumber)}`),

  // Admin
  adminDashboard: () => get<DashboardStats>("/api/admin/dashboard"),
  adminProducts: () => get<Product[]>("/api/admin/products"),
  adminCreateProduct: (data: AdminProductInput) => post<Product>("/api/admin/products", data),
  adminUpdateProduct: (id: string, data: AdminProductInput) =>
    put<Product>(`/api/admin/products/${id}`, data),
  adminHideProduct: (id: string) => del<void>(`/api/admin/products/${id}`),
  adminOrders: () => get<Order[]>("/api/admin/orders"),
  adminOrder: (id: string) => get<Order>(`/api/admin/orders/${id}`),
  adminUpdateOrder: (id: string, data: { status: Order["status"]; paymentNote?: string }) =>
    patch<Order>(`/api/admin/orders/${id}`, data),
};

export type AddressInput = {
  fullName: string;
  phone: string;
  city: string;
  addressLine: string;
  postalCode: string;
};

export type AdminProductInput = {
  name: string;
  description: string;
  imageUrl: string;
  priceTRY: number;
  categoryId: string;
  fulfillmentType: "STOCKED" | "ON_REQUEST";
  stock?: number;
  leadTimeDays?: number;
  active?: boolean;
};
