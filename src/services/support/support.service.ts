import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  CreateTicketInput,
  ReplyTicketInput,
  SupportTicket,
  TicketsListResponse,
  TicketsPagination,
  TicketsQuery,
} from '@/types/support';

/** Student support ticket APIs — all routes require authentication. */

interface TicketsListRaw {
  success: boolean;
  data: SupportTicket[];
  pagination: TicketsPagination;
}

export async function listTickets(query: TicketsQuery = {}): Promise<TicketsListResponse> {
  const params: Record<string, string | number> = {};
  if (query.page !== undefined) params.page = query.page;
  if (query.limit !== undefined) params.limit = query.limit;
  if (query.status) params.status = query.status;
  if (query.category) params.category = query.category;
  if (query.search) params.search = query.search;
  if (query.sort) params.sort = query.sort;

  const res = await apiClient.get<TicketsListRaw>('/support/tickets', { params });
  return { data: res.data.data, pagination: res.data.pagination };
}

export async function getTicket(id: string): Promise<SupportTicket> {
  const res = await apiClient.get<ApiEnvelope<SupportTicket>>(
    `/support/tickets/${encodeURIComponent(id)}`
  );
  return res.data.data;
}

export async function createTicket(input: CreateTicketInput): Promise<SupportTicket> {
  const res = await apiClient.post<ApiEnvelope<SupportTicket>>('/support/tickets', input);
  return res.data.data;
}

export async function replyToTicket(id: string, input: ReplyTicketInput): Promise<SupportTicket> {
  const res = await apiClient.post<ApiEnvelope<SupportTicket>>(
    `/support/tickets/${encodeURIComponent(id)}/replies`,
    input
  );
  return res.data.data;
}
