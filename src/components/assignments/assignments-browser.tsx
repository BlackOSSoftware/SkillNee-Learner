'use client';

import { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { useAssignments } from '@/hooks/assignments/use-assignments';
import { useMyCourses } from '@/hooks/enrollment/use-enrollment';
import { useDebounce } from '@/hooks/use-debounce';
import { AssignmentCard } from './assignment-card';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import type { StudentAssignmentFilter } from '@/types/assignments';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 12;
const SEARCH_PAGE_SIZE = 100;

const FILTERS: { value: StudentAssignmentFilter | ''; label: string }[] = [
  { value: '', label: 'All assignments' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past_due', label: 'Past due' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending_evaluation', label: 'Pending evaluation' },
  { value: 'evaluated', label: 'Graded' },
];

const selectClass =
  'h-10 rounded-lg border border-field-border bg-field px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export function AssignmentsBrowser() {
  const [courseId, setCourseId] = useState('');
  const [filter, setFilter] = useState<StudentAssignmentFilter | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);
  const searching = debouncedSearch.trim().length > 0;

  const myCourses = useMyCourses('all');
  const courseTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of myCourses.data?.courses ?? []) {
      map.set(c.course.id, c.course.title);
    }
    return map;
  }, [myCourses.data]);

  const query = useAssignments(
    {
      courseId: courseId || undefined,
      filter: filter || undefined,
      page,
      limit: searching ? SEARCH_PAGE_SIZE : PAGE_SIZE,
    },
    true
  );

  const allItems = useMemo(() => query.data?.assignments ?? [], [query.data]);
  const items = useMemo(() => {
    if (!searching) return allItems;
    const q = debouncedSearch.trim().toLowerCase();
    return allItems.filter((a) => a.title.toLowerCase().includes(q));
  }, [allItems, debouncedSearch, searching]);

  const pagination = query.data?.pagination;
  const showPagination = !searching && pagination && pagination.totalPages > 1;

  const hasFilters = Boolean(courseId || filter || search);
  const clearFilters = () => {
    setCourseId('');
    setFilter('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search assignments…"
              className="h-10 w-full rounded-lg border border-field-border bg-field pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search assignments"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setPage(1);
              }}
              className={selectClass}
              aria-label="Filter by course"
            >
              <option value="">All courses</option>
              {(myCourses.data?.courses ?? []).map((c) => (
                <option key={c.course.id} value={c.course.id}>
                  {c.course.title}
                </option>
              ))}
            </select>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as StudentAssignmentFilter | '');
                setPage(1);
              }}
              className={selectClass}
              aria-label="Filter by status"
            >
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load assignments"
          description="Your assignments are unavailable right now. Please try again."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title={hasFilters ? 'No assignments match' : 'No assignments yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Assignments published by your instructors will appear here.'
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
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-xs text-ink-subtle">
            {searching
              ? `${items.length} result${items.length === 1 ? '' : 's'} found`
              : pagination
                ? `${pagination.total} assignment${pagination.total === 1 ? '' : 's'}`
                : ''}
            {searching ? ' (searching your assignments)' : ''}
          </p>
          <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3', query.isFetching && 'opacity-70 transition-opacity')}>
            {items.map((a) => (
              <AssignmentCard key={a.id} assignment={a} courseTitle={courseTitleById.get(a.courseId)} />
            ))}
          </div>

          {showPagination ? (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPreviousPage}
                className="h-9 rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 text-sm text-ink-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="h-9 rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
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
