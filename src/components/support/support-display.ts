import type { TicketCategory, TicketPriority, TicketStatus } from '@/types/support';

export function ticketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case 'open': return 'Open';
    case 'reviewed': return 'In Review';
    case 'resolved': return 'Resolved';
    case 'closed': return 'Closed';
    default: return status;
  }
}

export function ticketPriorityLabel(priority: TicketPriority): string {
  switch (priority) {
    case 'low': return 'Low';
    case 'normal': return 'Normal';
    case 'high': return 'High';
    case 'urgent': return 'Urgent';
    default: return priority;
  }
}

export function ticketCategoryLabel(category: TicketCategory): string {
  switch (category) {
    case 'account_login': return 'Account & Login';
    case 'course_learning': return 'Course & Learning';
    case 'payment_fees': return 'Payment & Fees';
    case 'certificate': return 'Certificate';
    case 'technical_issue': return 'Technical Issue';
    case 'other': return 'Other';
    default: return category;
  }
}

export function ticketStatusStyle(status: TicketStatus): string {
  switch (status) {
    case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'reviewed': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'closed': return 'bg-slate-100 text-slate-600 border-slate-200';
    default: return 'bg-surface-2 text-ink-muted border-line';
  }
}

export function ticketPriorityStyle(priority: TicketPriority): string {
  switch (priority) {
    case 'low': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'normal': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'high': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'urgent': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-surface-2 text-ink-muted border-line';
  }
}

export function formatTicketDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTicketDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
