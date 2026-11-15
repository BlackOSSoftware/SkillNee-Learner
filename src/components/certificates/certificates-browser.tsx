'use client';

import { useMemo, useState } from 'react';
import { Award, Search, SearchX } from 'lucide-react';
import { useCertificates } from '@/hooks/certificates/use-certificates';
import { useDebounce } from '@/hooks/use-debounce';
import { CertificateCard } from './certificate-card';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import type { CertificateStatus, StudentCertificate } from '@/types/certificates';
import { cn } from '@/lib/cn';

type StatusFilter = 'all' | CertificateStatus;
type SortKey = 'issueDate_desc' | 'issueDate_asc' | 'courseName' | 'certificateNumber';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'issued', label: 'Issued' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'expired', label: 'Expired' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'issueDate_desc', label: 'Newest first' },
  { value: 'issueDate_asc', label: 'Oldest first' },
  { value: 'courseName', label: 'Course name' },
  { value: 'certificateNumber', label: 'Certificate number' },
];

function matchesStatus(c: StudentCertificate, filter: StatusFilter): boolean {
  return filter === 'all' || c.certificateStatus === filter;
}

function sortCertificates(list: StudentCertificate[], key: SortKey): StudentCertificate[] {
  const arr = [...list];
  switch (key) {
    case 'issueDate_desc':
      return arr.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    case 'issueDate_asc':
      return arr.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
    case 'courseName':
      return arr.sort((a, b) => a.courseName.localeCompare(b.courseName));
    case 'certificateNumber':
      return arr.sort((a, b) => a.certificateNumber.localeCompare(b.certificateNumber));
    default:
      return arr;
  }
}

const selectClass =
  'h-10 rounded-lg border border-field-border bg-field px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export function CertificatesBrowser() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('issueDate_desc');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const query = useCertificates();

  const items = useMemo(() => {
    const all = query.data ?? [];
    const q = debouncedSearch.trim().toLowerCase();
    const filtered = all.filter((c) => {
      if (!matchesStatus(c, status)) return false;
      if (!q) return true;
      return (
        c.certificateNumber.toLowerCase().includes(q) ||
        c.courseName.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.organizationName.toLowerCase().includes(q)
      );
    });
    return sortCertificates(filtered, sort);
  }, [query.data, status, sort, debouncedSearch]);

  const hasFilters = Boolean(status !== 'all' || search);
  const clearFilters = () => {
    setStatus('all');
    setSearch('');
    setSort('issueDate_desc');
  };

  return (
    <div className="space-y-5">
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
              placeholder="Search by certificate number, course or name…"
              className="h-10 w-full rounded-lg border border-field-border bg-field pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search certificates"
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
              aria-label="Sort certificates"
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
          title="Could not load certificates"
          description="Your certificates are unavailable right now. Please try again."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title={hasFilters ? 'No certificates match' : 'No certificates yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Certificates will appear here after you complete a course and meet the eligibility conditions.'
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
                <Award className="size-4 text-amber-500" aria-hidden />
                Complete a course to earn your first certificate.
              </div>
            )
          }
        />
      ) : (
        <>
          <p className="text-xs text-ink-subtle">
            {items.length} certificate{items.length === 1 ? '' : 's'}
            {status !== 'all' ? ` · ${STATUS_FILTERS.find((f) => f.value === status)?.label}` : ''}
          </p>
          <div
            className={cn(
              'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3',
              query.isFetching && 'opacity-70 transition-opacity'
            )}
          >
            {items.map((c) => (
              <CertificateCard key={c.id} certificate={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
