'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { CourseCardSkeleton, EmptyState, ErrorState } from '@/components/commerce/state-views';
import { CourseCardView } from '@/components/courses/course-card';
import { useCourseCategories, useCourses, useFeaturedCourses } from '@/hooks/courses/use-courses';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/cn';
import type { CourseLevel, PricingType } from '@/types/courses';

const PAGE_SIZE = 12;
const LEVELS: { value: CourseLevel | ''; label: string }[] = [
  { value: '', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all_levels', label: 'All levels' },
];
const PRICING: { value: PricingType | ''; label: string }[] = [
  { value: '', label: 'All pricing' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const selectClass =
  'h-10 rounded-lg border border-field-border bg-field px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState<CourseLevel | ''>('');
  const [language, setLanguage] = useState('');
  const [pricingType, setPricingType] = useState<PricingType | ''>('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);
  const debouncedLanguage = useDebounce(language, 350);

  const filtersActive = Boolean(
    debouncedSearch || categoryId || level || debouncedLanguage || pricingType
  );

  const coursesQuery = useCourses({
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    level: level || undefined,
    language: debouncedLanguage || undefined,
    pricingType: pricingType || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const categoriesQuery = useCourseCategories();
  const featuredQuery = useFeaturedCourses(!filtersActive);

  const categories = categoriesQuery.data ?? [];
  const courses = coursesQuery.data?.courses ?? [];
  const pagination = coursesQuery.data?.pagination;
  const featured = useMemo(() => featuredQuery.data ?? [], [featuredQuery.data]);

  const hasActiveFilters = Boolean(search || categoryId || level || language || pricingType);

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setLevel('');
    setLanguage('');
    setPricingType('');
    setPage(1);
  };

  const featuredIds = useMemo(() => new Set(featured.map((c) => c.id)), [featured]);
  const gridCourses = filtersActive ? courses : courses.filter((c) => !featuredIds.has(c.id));

  return (
    <div className="mx-auto max-w-7xl">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Explore Courses</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Browse the SkillBee catalog and find the right course for you.
        </p>
      </div>

      {/* Filters — search and filters on top, courses below */}
      <div className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-card">
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
              placeholder="Search courses…"
              className="h-10 w-full rounded-lg border border-field-border bg-field pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search courses"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-ink-subtle" aria-hidden />
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className={selectClass}
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value as CourseLevel | '');
                setPage(1);
              }}
              className={selectClass}
              aria-label="Filter by level"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setPage(1);
              }}
              placeholder="Language"
              className={cn(selectClass, 'w-28')}
              aria-label="Filter by language"
            />
            <select
              value={pricingType}
              onChange={(e) => {
                setPricingType(e.target.value as PricingType | '');
                setPage(1);
              }}
              className={selectClass}
              aria-label="Filter by pricing"
            >
              {PRICING.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-4" aria-hidden />
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Results — courses below the filters */}
      {coursesQuery.isPending ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : coursesQuery.isError ? (
        <ErrorState
          title="Could not load courses"
          description="The course catalog is unavailable right now. Please try again."
          onRetry={() => coursesQuery.refetch()}
          retrying={coursesQuery.isFetching}
        />
      ) : gridCourses.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title="No courses found"
          description={
            hasActiveFilters
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'There are no published courses in the catalog yet.'
          }
          action={
            hasActiveFilters ? (
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
          <p className="mb-4 text-xs text-ink-subtle">
            {pagination ? `${pagination.total} course${pagination.total === 1 ? '' : 's'}` : ''}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridCourses.map((course) => (
              <CourseCardView key={course.id} course={course} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-2">
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

      {/* Featured rail — below the course grid, only on the unfiltered view */}
      {!filtersActive && featured.length > 0 ? (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Featured courses</h3>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.slice(0, 4).map((course) => (
              <CourseCardView key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Category chips */}
      {categories.length > 0 && !filtersActive ? (
        <section className="mt-12">
          <h3 className="mb-4 text-lg font-semibold text-ink">Browse by category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id);
                  setPage(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-primary/40 hover:text-primary"
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-10 text-center">
        <Link href="/my-courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          View my enrolled courses
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </p>
    </div>
  );
}
