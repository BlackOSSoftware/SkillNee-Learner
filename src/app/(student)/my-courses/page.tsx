'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpen, GraduationCap, Search } from 'lucide-react';
import { CourseFilters } from '@/components/learning/course-filters';
import { EnrolledCourseCard } from '@/components/learning/enrolled-course-card';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import { useMyCourses } from '@/hooks/enrollment/use-enrollment';
import { useAuth } from '@/providers/auth-provider';
import type { MyCoursesFilter } from '@/types/learning';

const FILTER_LABELS: Record<MyCoursesFilter, string> = {
  all: 'courses',
  active: 'active courses',
  in_progress: 'courses in progress',
  completed: 'completed courses',
  pending: 'pending courses',
  not_started: 'courses not started',
  expired: 'expired courses',
};

export default function MyCoursesPage() {
  const { status } = useAuth();
  const [filter, setFilter] = useState<MyCoursesFilter>('all');
  const [search, setSearch] = useState('');

  const coursesQuery = useMyCourses(filter, status === 'authenticated');
  const courses = useMemo(() => coursesQuery.data?.courses ?? [], [coursesQuery.data?.courses]);

  // Local search over already-loaded records (backend has no search param for my-courses).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.course.title.toLowerCase().includes(q));
  }, [courses, search]);

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full max-w-2xl" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<GraduationCap className="size-6" aria-hidden />}
          title="Sign in to view your courses"
          description="Your enrolled courses and learning progress are tied to your account."
          action={
            <Link
              href="/login?next=/my-courses"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  const isEmpty = !coursesQuery.isPending && !coursesQuery.isError && courses.length === 0;
  const noMatches = !coursesQuery.isPending && courses.length > 0 && filtered.length === 0;

  return (
    <div className="mx-auto max-w-7xl animate-page-enter">
      {/* Header */}
      <div className="animate-card-enter mb-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">My Courses</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Continue learning, track your progress, and manage your enrolled courses.
            </p>
          </div>
        </div>
      </div>

      {/* Filters + search */}
      <div className="animate-card-enter animate-card-enter-1 mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CourseFilters value={filter} onChange={setFilter} />
        <div className="relative lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my courses…"
            className="h-10 w-full rounded-lg border border-field-border bg-field pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Search enrolled courses"
          />
        </div>
      </div>

      {/* Content */}
      {coursesQuery.isPending ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : coursesQuery.isError ? (
        <ErrorState
          title="Could not load your courses"
          description="Please try again in a moment."
          onRetry={() => coursesQuery.refetch()}
          retrying={coursesQuery.isFetching}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={<BookOpen className="size-6" aria-hidden />}
          title={filter === 'all' ? 'No enrolled courses yet' : `No ${FILTER_LABELS[filter]} found`}
          description={
            filter === 'all'
              ? 'You have not enrolled in any courses yet. Browse the catalog to get started.'
              : `There are no ${FILTER_LABELS[filter]} right now. Try a different filter.`
          }
          action={
            <Link
              href="/courses"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              Browse courses
            </Link>
          }
        />
      ) : noMatches ? (
        <EmptyState
          icon={<Search className="size-6" aria-hidden />}
          title="No courses match your search"
          description={`Nothing in ${FILTER_LABELS[filter]} matches "${search}".`}
          action={
            <button
              type="button"
              onClick={() => setSearch('')}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2"
            >
              Clear search
            </button>
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-subtle">
            Showing {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
            {filter !== 'all' ? ` · ${FILTER_LABELS[filter]}` : ''}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, i) => (
              <EnrolledCourseCard key={course.enrollmentId} course={course} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
