'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, LifeBuoy, MessageSquare, Plus, Search, SearchX, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTickets } from '@/hooks/support/use-support';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/providers/auth-provider';
import { TicketCard } from './ticket-card';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import type { TicketStatus } from '@/types/support';
import { cn } from '@/lib/cn';

type StatusFilter = 'all' | TicketStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All tickets' },
  { value: 'open', label: 'Open' },
  { value: 'reviewed', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PAGE_SIZE = 20;

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'muted';
}) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-rose-500/10 text-rose-600',
    muted: 'bg-surface-2 text-ink-muted',
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <span className={cn('flex size-10 items-center justify-center rounded-xl', tones[tone])}>{icon}</span>
      <div>
        <p className="text-2xl font-bold tracking-tight text-ink">{value}</p>
        <p className="text-xs font-medium text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

export function SupportBrowser() {
  const { status: authStatus } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const query = useTickets(
    {
      page,
      limit: PAGE_SIZE,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: debouncedSearch || undefined,
      sort: 'last_activity',
    },
    authStatus === 'authenticated'
  );

  const tickets = useMemo(() => query.data?.data ?? [], [query.data]);
  const pagination = query.data?.pagination;

  // Stats from current page (approximation — full stats would need all tickets)
  const stats = useMemo(() => {
    const all = tickets;
    return {
      total: pagination?.total ?? all.length,
      open: all.filter((t) => t.status === 'open').length,
      reviewed: all.filter((t) => t.status === 'reviewed').length,
      resolved: all.filter((t) => t.status === 'resolved').length,
      closed: all.filter((t) => t.status === 'closed').length,
    };
  }, [tickets, pagination]);

  const hasFilters = Boolean(statusFilter !== 'all' || search);
  const clearFilters = () => {
    setStatusFilter('all');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard icon={<MessageSquare className="size-5" aria-hidden />} label="Total" value={stats.total} tone="primary" />
        <StatCard icon={<Clock className="size-5" aria-hidden />} label="Open" value={stats.open} tone="warning" />
        <StatCard icon={<LifeBuoy className="size-5" aria-hidden />} label="In Review" value={stats.reviewed} tone="primary" />
        <StatCard icon={<CheckCircle2 className="size-5" aria-hidden />} label="Resolved" value={stats.resolved} tone="success" />
        <StatCard icon={<XCircle className="size-5" aria-hidden />} label="Closed" value={stats.closed} tone="muted" />
      </div>

      {/* Create action */}
      <div className="flex justify-end">
        <Link
          href="/support/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-pop"
        >
          <Plus className="size-4" aria-hidden />
          Create New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ticket number, subject or description…"
              className="h-10 w-full rounded-lg border border-field-border bg-field pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search tickets"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
              className="h-10 rounded-lg border border-field-border bg-field px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Results */}
      {query.isPending ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load tickets"
          description="Your support tickets are unavailable right now. Please try again."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title={hasFilters ? 'No tickets match' : 'No support tickets yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Need help? Create a support ticket and our team will assist you.'
          }
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                href="/support/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
              >
                <Plus className="size-4" aria-hidden />
                Create your first ticket
              </Link>
            )
          }
        />
      ) : (
        <>
          <p className="text-xs text-ink-subtle">
            {pagination?.total ?? tickets.length} ticket{(pagination?.total ?? tickets.length) === 1 ? '' : 's'}
            {pagination && pagination.totalPages > 1 ? ` · Page ${pagination.page} of ${pagination.totalPages}` : ''}
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tickets.map((t) => (
              <TicketCard key={t.id} ticket={t} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPreviousPage}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-ink-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
