'use client';

import { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { useStudentQuizzes } from '@/hooks/quizzes/use-quizzes';
import { useMyCourses } from '@/hooks/enrollment/use-enrollment';
import { useDebounce } from '@/hooks/use-debounce';
import { QuizCard } from './quiz-card';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import type { StudentQuizListItem } from '@/types/quizzes';
import { cn } from '@/lib/cn';

type StatusFilter = 'all' | 'available' | 'in_progress' | 'completed' | 'passed' | 'failed';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All quizzes' },
  { value: 'available', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
];

function matchesStatus(quiz: StudentQuizListItem, filter: StatusFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'available':
      return quiz.myAttempts.total === 0 && quiz.canStart;
    case 'in_progress':
      return Boolean(quiz.myAttempts.inProgress);
    case 'completed':
      return quiz.myAttempts.completed > 0;
    case 'passed':
      return quiz.myAttempts.bestPassed === true;
    case 'failed':
      return quiz.myAttempts.completed > 0 && quiz.myAttempts.bestPassed === false;
    default:
      return true;
  }
}

const selectClass =
  'h-10 rounded-lg border border-field-border bg-field px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export function QuizzesBrowser() {
  const [courseId, setCourseId] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 350);
  const myCourses = useMyCourses('all');

  const query = useStudentQuizzes({
    courseId: courseId || undefined,
    search: debouncedSearch.trim() || undefined,
    limit: 100,
  });

  const items = useMemo(() => {
    const all = query.data?.quizzes ?? [];
    return all.filter((q) => matchesStatus(q, status));
  }, [query.data, status]);

  const hasFilters = Boolean(courseId || status !== 'all' || search);
  const clearFilters = () => {
    setCourseId('');
    setStatus('all');
    setSearch('');
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
              placeholder="Search quizzes…"
              className="h-10 w-full rounded-lg border border-field-border bg-field pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search quizzes"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
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
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load quizzes"
          description="Your quizzes are unavailable right now. Please try again."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title={hasFilters ? 'No quizzes match' : 'No quizzes yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Quizzes published for your enrolled courses will appear here.'
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
            {items.length} quiz{items.length === 1 ? '' : 's'}
            {status !== 'all' ? ` · ${STATUS_FILTERS.find((f) => f.value === status)?.label}` : ''}
          </p>
          <div
            className={cn(
              'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3',
              query.isFetching && 'opacity-70 transition-opacity'
            )}
          >
            {items.map((q) => (
              <QuizCard key={q.id} quiz={q} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
