import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type { CheckoutInput, CheckoutResult, Order } from '@/types/commerce';

/** Checkout + student order APIs. Prices are always computed server-side. */

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const res = await apiClient.post<ApiEnvelope<CheckoutResult>>('/student/checkout', input);
  return res.data.data;
}

export async function getMyOrder(orderId: string): Promise<Order> {
  const res = await apiClient.get<ApiEnvelope<{ order: Order }>>(
    `/student/orders/${encodeURIComponent(orderId)}`
  );
  return res.data.data.order;
}
