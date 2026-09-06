// Mirrors the shapes returned by the backend (zuri-express-backend). Kept as
// plain types, not generated, since the API is small and stable — see that
// project's README "API reference" for the source of truth.

export type Role = "CUSTOMER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  emailVerified: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type FulfillmentType = "STOCKED" | "ON_REQUEST";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  priceKurus: number;
  categoryId: string;
  category: Category;
  fulfillmentType: FulfillmentType;
  stock: number | null;
  leadTimeDays: number | null;
  active: boolean;
  createdAt: string;
};

// CASH_ON_DELIVERY is no longer offered at checkout (see CheckoutPage's
// PAYMENT_METHODS list) but stays in this type so an order placed before it
// was removed still displays correctly (OrderDetailPage/AdminOrderDetailPage).
export type ManualPaymentMethod = "BANK_TRANSFER" | "MPESA" | "CASH_ON_DELIVERY";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_RECEIVED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  addressLine: string;
  postalCode: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  unitPriceKurus: number;
  quantity: number;
  fulfillmentType: FulfillmentType;
  lineTotalKurus: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: ManualPaymentMethod;
  paymentNote: string | null;
  subtotalKurus: number;
  createdAt: string;
  address: Address;
  items: OrderItem[];
  user?: { name: string; email: string };
};

export type DashboardStats = {
  pendingOrders: number;
  totalOrders: number;
  activeProducts: number;
  lowStock: Product[];
  recentOrders: Order[];
};

// Server-side cart (see the backend's src/lib/cart.ts) — every cart
// endpoint returns items already joined with live product data, so the
// frontend never needs a separate product fetch just to render the cart.
export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
};
