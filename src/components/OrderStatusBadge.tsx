import type { OrderStatus } from "../lib/types";

const LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAYMENT_RECEIVED: "Payment received",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const CLASSES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "status-pending",
  PAYMENT_RECEIVED: "status-ok",
  PROCESSING: "status-ok",
  SHIPPED: "status-ok",
  DELIVERED: "status-done",
  CANCELLED: "status-cancelled",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge ${CLASSES[status]}`}>{LABELS[status]}</span>;
}
