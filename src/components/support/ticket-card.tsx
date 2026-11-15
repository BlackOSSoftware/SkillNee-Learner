'use client';

import Link from 'next/link';
import { Calendar, Clock, Eye, MessageSquare } from 'lucide-react';
import type { SupportTicket } from '@/types/support';
import { TicketPriorityBadge, TicketStatusBadge } from './ticket-status-badge';
import { formatTicketDate, relativeTime, ticketCategoryLabel } from './support-display';

export function TicketCard({ ticket }: { ticket: SupportTicket }) {
  const messageCount = ticket.messages?.length ?? 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-pop">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-line/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-sm font-bold tracking-wide text-ink">{ticket.ticketNumber}</p>
            <p className="mt-0.5 text-xs text-ink-subtle">{ticketCategoryLabel(ticket.category)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-5 py-4">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{ticket.subject}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-muted">{ticket.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-subtle">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" aria-hidden />
            {formatTicketDate(ticket.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1" title={new Date(ticket.lastActivityAt).toLocaleString()}>
            <Clock className="size-3" aria-hidden />
            {relativeTime(ticket.lastActivityAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3" aria-hidden />
            {messageCount} message{messageCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="border-t border-line/60 px-5 py-3.5">
        <Link
          href={`/support/${ticket.id}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
        >
          <Eye className="size-4" aria-hidden />
          View conversation
        </Link>
      </div>
    </div>
  );
}
