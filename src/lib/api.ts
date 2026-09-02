import type {
  Category,
  DashboardStats,
  ManualPaymentMethod,
  Order,
  Product,
  User,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

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
  signup: (data: { name: string; email: string; password: string }) =>
    post<User>("/api/auth/signup", data),
  login: (data: { email: string; password: string }) => post<User>("/api/auth/login", data),
  loginWithGoogle: (credential: string) => post<User>("/api/auth/google", { credential }),
  logout: () => post<void>("/api/auth/logout"),
  me: () => get<User>("/api/auth/me"),
  verifyEmail: (token: string) =>
    get<{ verified: true }>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: () => post<{ sent?: true; alreadyVerified?: true }>("/api/auth/resend-verification"),

  // Catalog
  categories: () => get<Category[]>("/api/categories"),
  products: (categorySlug?: string) =>
    get<Product[]>(`/api/products${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ""}`),
  product: (slug: string) => get<Product>(`/api/products/${encodeURIComponent(slug)}`),

  // Orders
  checkout: (data: {
    items: { productId: string; quantity: number }[];
    address: {
      fullName: string;
      phone: string;
      city: string;
      addressLine: string;
      postalCode: string;
    };
    paymentMethod: ManualPaymentMethod;
  }) => post<Order>("/api/orders", data),
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
