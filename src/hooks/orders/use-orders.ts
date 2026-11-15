'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { downloadInvoice, getOrder, listOrders, saveBlobAs } from '@/services/orders/orders.service';
import type { Order } from '@/types/commerce';

export function useOrders(enabled = true) {
  return useQuery<Order[]>({
    queryKey: queryKeys.orders.list,
    queryFn: listOrders,
    enabled,
    staleTime: 30_000,
  });
}

export function useOrder(id: string | undefined, enabled = true) {
  return useQuery<Order>({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => getOrder(id as string),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: ({ id, fallbackName }: { id: string; fallbackName: string }) =>
      downloadInvoice(id, fallbackName),
    onSuccess: ({ blob, fileName }) => {
      saveBlobAs(blob, fileName);
    },
  });
}
