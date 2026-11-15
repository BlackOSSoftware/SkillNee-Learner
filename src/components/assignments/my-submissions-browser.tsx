'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { ArrowRight, SearchX } from 'lucide-react';
import { useMyCourses } from '@/hooks/enrollment/use-enrollment';
import { useMySubmissions } from '@/hooks/assignments/use-assignments';
import { getAssignment } from '@/services/assignments/assignments.service';
import { queryKeys } from '@/lib/query-keys';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import { SubmissionStatusBadge } from './status-badges';
import { formatDateTime } from './assignment-display';
import type { SubmissionStatus } from '@/types/assignments';
import { cn } from '@/lib/cn';

const PAGE_SIZE = 12;

const STATUS_FILTERS: { value: SubmissionStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under review' },
  { value: 'resubmitted', label: 'Resubmitted' },
  { value: 'evaluated', label: 'Graded' },
  { value: 'returned', label: 'Returned' },
];

const selectClass =
  'h-10 rounded-lg border border-field-border bg-field px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export function MySubmissionsBrowser() {
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState<SubmissionStatus | ''>('');
  const [page, setPage] = useState(1);

  const myCourses = useMyCourses('all');
  const courseTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of myCourses.data?.courses ?? []) {
      map.set(c.course.id, c.course.title);
    }
    return map;
  }, [myCourses.data]);

  const query = useMySubmissions({
    courseId: courseId || undefined,
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const submissions = useMemo(() => query.data?.submissions ?? [], [query.data]);
  const pagination = query.data?.pagination;
  const hasFilters = Boolean(courseId || status);

  // Submission payloads carry assignmentId only — resolve real titles via the
  // existing assignment detail endpoint (one cached query per visible row).
  const titleQueries = useQueries({
    queries: submissions.map((s) => ({
      queryKey: queryKeys.assignments.detail(s.assignmentId),
      queryFn: () => getAssignment(s.assignmentId),
      staleTime: 60_000,
      retry: 1,
    })),
  });
  const titleByAssignmentId = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s, i) => {
      const title = titleQueries[i]?.data?.assignment?.title;
      if (title) map.set(s.assignmentId, title);
    });
    return map;
  }, [submissions, titleQueries]);

  const clearFilters = () => {
    setCourseId('');
    setStatus('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SubmissionStatus | '');
              setPage(1);
            }}
            className={selectClass}
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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

      {query.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load submissions"
          description="Your submission history is unavailable right now. Please try again."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title={hasFilters ? 'No submissions match' : 'No submissions yet'}
          description={
            hasFilters
              ? 'Try adjusting your filters.'
              : 'Once you submit an assignment, it will appear here with its evaluation status.'
          }
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-xs text-ink-subtle">
            {pagination ? `${pagination.total} submission${pagination.total === 1 ? '' : 's'}` : ''}
          </p>
          <ul className={cn('space-y-3', query.isFetching && 'opacity-70 transition-opacity')}>
            {submissions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/assignments/submissions/${s.id}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4 shadow-card transition-all hover:border-primary/40 hover:shadow-pop sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink group-hover:text-primary">
                      {titleByAssignmentId.get(s.assignmentId) ?? 'Assignment'}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {courseTitleById.get(s.courseId) ?? 'Course'} · Submitted{' '}
                      {formatDateTime(s.submittedAt)}
                      {s.isLate ? ' · late' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {s.marksAwarded != null ? (
                      <span className="text-sm font-semibold text-ink">
                        {s.marksAwarded} marks
                      </span>
                    ) : null}
                    <SubmissionStatusBadge status={s.submissionStatus} />
                    <ArrowRight className="size-4 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {pagination && pagination.totalPages > 1 ? (
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
