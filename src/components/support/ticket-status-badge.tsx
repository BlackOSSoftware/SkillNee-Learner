'use client';

import { cn } from '@/lib/cn';
import type { TicketPriority, TicketStatus } from '@/types/support';
import { ticketPriorityLabel, ticketPriorityStyle, ticketStatusLabel, ticketStatusStyle } from './support-display';

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        ticketStatusStyle(status)
      )}
    >
      {ticketStatusLabel(status)}
    </span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        ticketPriorityStyle(priority)
      )}
    >
      {ticketPriorityLabel(priority)}
    </span>
  );
}
