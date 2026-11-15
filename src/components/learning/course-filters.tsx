'use client';

import { cn } from '@/lib/cn';
import type { MyCoursesFilter } from '@/types/learning';

export const MY_COURSE_FILTERS: { value: MyCoursesFilter; label: string }[] = [
  { value: 'all', label: 'All Courses' },
  { value: 'active', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'expired', label: 'Expired' },
];

export function CourseFilters({
  value,
  onChange,
  counts,
}: {
  value: MyCoursesFilter;
  onChange: (f: MyCoursesFilter) => void;
  counts?: Partial<Record<MyCoursesFilter, number>>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter courses"
      className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2/70 p-1 scrollbar-none"
    >
      {MY_COURSE_FILTERS.map((f) => {
        const active = value === f.value;
        const count = counts?.[f.value];
        return (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all',
              active
                ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            {f.label}
            {typeof count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                  active ? 'bg-primary/10 text-primary' : 'bg-surface text-ink-subtle'
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
