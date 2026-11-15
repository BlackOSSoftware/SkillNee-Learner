'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { createCheckout } from '@/services/checkout/checkout.service';
import type { CheckoutInput, CheckoutResult } from '@/types/commerce';

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation<CheckoutResult, unknown, CheckoutInput>({
    mutationFn: createCheckout,
    onSuccess: (result) => {
      // Cart may have been cleared server-side; refresh it.
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      if (result.order?.id) {
        queryClient.setQueryData(queryKeys.checkout.order(result.order.id), result.order);
      }
    },
  });
}
