/** Support ticket types — mirrors backend SupportTicket model. */

export type TicketStatus = 'open' | 'reviewed' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory =
  | 'account_login'
  | 'course_learning'
  | 'payment_fees'
  | 'certificate'
  | 'technical_issue'
  | 'other';
export type TicketSenderRole = 'student' | 'admin' | 'instructor';
export type MessageVisibility = 'public' | 'internal';

export interface TicketAttachment {
  id?: string;
  mediaAssetId: string | null;
  fileName: string;
  mimeType: string;
  publicUrl: string;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderRole: TicketSenderRole;
  visibility: MessageVisibility;
  message: string;
  attachments: TicketAttachment[];
  notifiedAt: string | null;
  createdAt: string;
}

export interface TicketStatusHistoryEntry {
  from: string | null;
  to: string;
  actorId: string | null;
  at: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  studentId: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  messages: TicketMessage[];
  statusHistory: TicketStatusHistoryEntry[];
  resolvedAt: string | null;
  closedAt: string | null;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TicketsListResponse {
  data: SupportTicket[];
  pagination: TicketsPagination;
}

export interface TicketsQuery {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  category?: TicketCategory;
  search?: string;
  sort?: 'newest' | 'last_activity';
}

export interface CreateTicketInput {
  category: TicketCategory;
  subject: string;
  description: string;
  priority?: TicketPriority;
}

export interface ReplyTicketInput {
  message: string;
  attachments?: {
    mediaAssetId?: string | null;
    fileName?: string;
    mimeType?: string;
    publicUrl?: string;
  }[];
  idempotencyKey?: string;
}
