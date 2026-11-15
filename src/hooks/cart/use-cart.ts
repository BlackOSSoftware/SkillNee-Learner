'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { addCartItem, clearCart, getCart, removeCartItem } from '@/services/cart/cart.service';
import type { Cart } from '@/types/commerce';

/** Cart queries/mutations. All mutations return the authoritative cart from the backend. */

export function useCart(enabled = true) {
  return useQuery<Cart>({
    queryKey: queryKeys.cart.detail,
    queryFn: getCart,
    enabled,
    staleTime: 15_000,
  });
}

function useCartMutation<TArgs>(
  fn: (args: TArgs) => Promise<Cart>,
  options?: { onSuccess?: (cart: Cart) => void; onError?: (error: unknown) => void }
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart.detail, cart);
      options?.onSuccess?.(cart);
    },
    onError: options?.onError,
  });
}

export function useAddToCart() {
  return useCartMutation((courseId: string) => addCartItem(courseId));
}

export function useRemoveCartItem() {
  return useCartMutation((courseId: string) => removeCartItem(courseId));
}

export function useClearCart() {
  return useCartMutation(() => clearCart());
}
