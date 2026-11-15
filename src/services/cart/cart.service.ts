import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type { Cart, CartEnvelope } from '@/types/commerce';

/** Student cart APIs — all routes require authentication. */

export async function getCart(): Promise<Cart> {
  const res = await apiClient.get<ApiEnvelope<CartEnvelope>>('/student/cart');
  return res.data.data.cart;
}

export async function addCartItem(courseId: string): Promise<Cart> {
  const res = await apiClient.post<ApiEnvelope<CartEnvelope>>('/student/cart/items', { courseId });
  return res.data.data.cart;
}

export async function removeCartItem(courseId: string): Promise<Cart> {
  const res = await apiClient.delete<ApiEnvelope<CartEnvelope>>(
    `/student/cart/items/${encodeURIComponent(courseId)}`
  );
  return res.data.data.cart;
}

export async function clearCart(): Promise<Cart> {
  const res = await apiClient.delete<ApiEnvelope<CartEnvelope>>('/student/cart');
  return res.data.data.cart;
}
