'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  capturePayPalOrder,
  createPayPalOrder,
  createRazorpayOrder,
  getAvailableGateways,
  verifyRazorpayPayment,
} from '@/services/payments/payments.service';
import type {
  AvailableGateways,
  PayPalCaptureResult,
  PayPalOrderResult,
  RazorpayOrderResult,
  RazorpayVerifyInput,
  RazorpayVerifyResult,
} from '@/types/commerce';

export function useAvailableGateways(orderId: string | null) {
  return useQuery<AvailableGateways>({
    queryKey: queryKeys.payments.gateways(orderId ?? ''),
    queryFn: () => getAvailableGateways(orderId as string),
    enabled: Boolean(orderId),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCreateRazorpayOrder() {
  return useMutation<RazorpayOrderResult, unknown, string>({
    mutationFn: (orderId) => createRazorpayOrder(orderId),
  });
}

export function useVerifyRazorpayPayment() {
  const queryClient = useQueryClient();
  return useMutation<RazorpayVerifyResult, unknown, RazorpayVerifyInput>({
    mutationFn: verifyRazorpayPayment,
    onSuccess: (result) => {
      if (result.order?.id) {
        queryClient.setQueryData(queryKeys.checkout.order(result.order.id), result.order);
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      }
    },
  });
}

export function useCreatePayPalOrder() {
  return useMutation<PayPalOrderResult, unknown, string>({
    mutationFn: (orderId) => createPayPalOrder(orderId),
  });
}

export function useCapturePayPalOrder() {
  const queryClient = useQueryClient();
  return useMutation<PayPalCaptureResult, unknown, { orderId: string; paypalOrderId?: string }>({
    mutationFn: ({ orderId, paypalOrderId }) => capturePayPalOrder(orderId, paypalOrderId),
    onSuccess: (result) => {
      if (result.order?.id) {
        queryClient.setQueryData(queryKeys.checkout.order(result.order.id), result.order);
        queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      }
    },
  });
}
