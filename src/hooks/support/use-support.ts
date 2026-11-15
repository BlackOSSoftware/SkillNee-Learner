'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  createTicket,
  getTicket,
  listTickets,
  replyToTicket,
} from '@/services/support/support.service';
import type {
  CreateTicketInput,
  ReplyTicketInput,
  SupportTicket,
  TicketsListResponse,
  TicketsQuery,
} from '@/types/support';

/** Support ticket queries and mutations. */

export function useTickets(query: TicketsQuery = {}, enabled = true) {
  return useQuery<TicketsListResponse>({
    queryKey: queryKeys.support.list(query as Record<string, unknown>),
    queryFn: () => listTickets(query),
    enabled,
    staleTime: 15_000,
  });
}

export function useTicket(id: string | undefined, enabled = true) {
  return useQuery<SupportTicket>({
    queryKey: queryKeys.support.detail(id ?? ''),
    queryFn: () => getTicket(id as string),
    enabled: enabled && Boolean(id),
    staleTime: 15_000,
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.support.all });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, unknown, CreateTicketInput>({
    mutationFn: createTicket,
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useReplyToTicket(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, unknown, ReplyTicketInput>({
    mutationFn: (input) => replyToTicket(ticketId, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}
