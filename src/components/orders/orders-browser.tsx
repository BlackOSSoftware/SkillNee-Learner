'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Package, Receipt, Search, SearchX, XCircle } from 'lucide-react';
import { useOrders } from '@/hooks/orders/use-orders';
import { useDebounce } from '@/hooks/use-debounce';
import { OrderCard } from './order-card';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import type { Order } from '@/types/commerce';
import { cn } from '@/lib/cn';

type StatusFilter = 'all' | 'completed' | 'pending' | 'cancelled' | 'failed' | 'refunded';
type SortKey = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'orderNumber';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All orders' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'date_asc', label: 'Oldest first' },
  { value: 'amount_desc', label: 'Highest amount' },
  { value: 'amount_asc', label: 'Lowest amount' },
  { value: 'orderNumber', label: 'Order number' },
];

function matchesStatus(o: Order, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return o.orderStatus === 'pending' || o.orderStatus === 'processing';
  if (filter === 'cancelled') return o.orderStatus === 'cancelled';
  if (filter === 'failed') return o.orderStatus === 'failed';
  if (filter === 'refunded') return o.orderStatus === 'refunded' || o.orderStatus === 'partially_refunded';
  if (filter === 'completed') return o.orderStatus === 'completed';
  return true;
}

function sortOrders(list: Order[], key: SortKey): Order[] {
  const arr = [...list];
  switch (key) {
    case 'date_desc':
      return arr.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    case 'date_asc':
      return arr.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
    case 'amount_desc':
      return arr.sort((a, b) => (b.totalAmount ?? 0) - (a.totalAmount ?? 0));
    case 'amount_asc':
      return arr.sort((a, b) => (a.totalAmount ?? 0) - (b.totalAmount ?? 0));
    case 'orderNumber':
      return arr.sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
    default:
      return arr;
  }
}

const selectClass =
  'h-10 rounded-lg border border-field-border bg-field px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-rose-500/10 text-rose-600',
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

export function OrdersBrowser() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('date_desc');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const query = useOrders();

  const stats = useMemo(() => {
    const all = query.data ?? [];
    return {
      total: all.length,
      completed: all.filter((o) => o.orderStatus === 'completed').length,
      pending: all.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing').length,
      cancelled: all.filter((o) => o.orderStatus === 'cancelled' || o.orderStatus === 'failed').length,
    };
  }, [query.data]);

  const items = useMemo(() => {
    const all = query.data ?? [];
    const q = debouncedSearch.trim().toLowerCase();
    const filtered = all.filter((o) => {
      if (!matchesStatus(o, status)) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.items?.some((i) => i.courseName.toLowerCase().includes(q)) ||
        o.couponSnapshot?.code?.toLowerCase().includes(q)
      );
    });
    return sortOrders(filtered, sort);
  }, [query.data, status, sort, debouncedSearch]);

  const hasFilters = Boolean(status !== 'all' || search);
  const clearFilters = () => {
    setStatus('all');
    setSearch('');
    setSort('date_desc');
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Package className="size-5" aria-hidden />} label="Total orders" value={stats.total} tone="primary" />
        <StatCard icon={<CheckCircle2 className="size-5" aria-hidden />} label="Completed" value={stats.completed} tone="success" />
        <StatCard icon={<Clock className="size-5" aria-hidden />} label="Pending" value={stats.pending} tone="warning" />
        <StatCard icon={<XCircle className="size-5" aria-hidden />} label="Cancelled / Failed" value={stats.cancelled} tone="danger" />
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number or course…"
              className="h-10 w-full rounded-lg border border-field-border bg-field pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search orders"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className={selectClass}
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={selectClass}
              aria-label="Sort orders"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
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
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load orders"
          description="Your order history is unavailable right now. Please try again."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title={hasFilters ? 'No orders match' : 'No orders yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Your order history will appear here after you make a purchase.'
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
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Receipt className="size-4 text-primary" aria-hidden />
                Browse courses to make your first purchase.
              </div>
            )
          }
        />
      ) : (
        <>
          <p className="text-xs text-ink-subtle">
            {items.length} order{items.length === 1 ? '' : 's'}
            {status !== 'all' ? ` · ${STATUS_FILTERS.find((f) => f.value === status)?.label}` : ''}
          </p>
          <div
            className={cn(
              'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3',
              query.isFetching && 'opacity-70 transition-opacity'
            )}
          >
            {items.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
