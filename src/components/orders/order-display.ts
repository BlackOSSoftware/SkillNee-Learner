import type { Order } from '@/types/commerce';

export function formatOrderDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatOrderDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function orderStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'processing': return 'Processing';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'failed': return 'Failed';
    case 'refunded': return 'Refunded';
    case 'partially_refunded': return 'Partially refunded';
    default: return status;
  }
}

export function paymentStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'authorized': return 'Authorized';
    case 'captured': return 'Paid';
    case 'failed': return 'Failed';
    case 'partially_refunded': return 'Partially refunded';
    case 'refunded': return 'Refunded';
    default: return status;
  }
}

export function gatewayLabel(gateway: string): string {
  switch (gateway) {
    case 'razorpay': return 'Razorpay';
    case 'paypal': return 'PayPal';
    case 'none': return 'No payment';
    default: return gateway;
  }
}

export function invoiceFileName(order: Pick<Order, 'orderNumber' | 'invoiceNumber'>): string {
  const base = order.invoiceNumber || order.orderNumber || 'invoice';
  return `${base.replace(/[^A-Za-z0-9-]/g, '_')}.pdf`;
}

export function itemCount(order: Order): number {
  return order.items?.length ?? 0;
}
