'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { MyCourse } from '@/types/enrollment';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  in_progress: { label: 'In progress', className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  completed: { label: 'Completed', className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  not_started: { label: 'Not started', className: 'bg-surface-2 text-ink-muted ring-1 ring-line' },
  expired: { label: 'Expired', className: 'bg-danger/10 text-danger' },
  revoked: { label: 'Revoked', className: 'bg-danger/10 text-danger' },
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? { label: status, className: 'bg-surface-2 text-ink-muted ring-1 ring-line' };
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EnrolledCourseCard({ course, index = 0 }: { course: MyCourse; index?: number }) {
  const pct = Math.round(course.progressPercentage || 0);
  const status = statusStyle(course.enrollmentStatus);
  const completion = course.courseCompletionStatus;
  const isCompleted = completion === 'completed' || course.enrollmentStatus === 'completed';
  const isExpired = course.enrollmentStatus === 'expired';
  const thumb = course.course.thumbnail?.secureUrl || course.course.thumbnail?.url;
  const expires = formatDate(course.enrollmentExpiresAt);
  const lastActive = formatDate(course.lastAccessedAt);
  const nextLesson = course.nextIncompleteLesson;

  return (
    <article
      className={cn(
        'animate-card-enter group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-pop',
        `animate-card-enter-${Math.min(index + 1, 4)}`
      )}
    >
      {/* Thumbnail */}
      <Link href={`/my-courses/${course.course.id}`} className="relative block aspect-[16/9] overflow-hidden bg-surface-2">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={course.course.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5 text-primary">
            <BookOpen className="size-8 opacity-50" aria-hidden />
          </span>
        )}
        <span className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" aria-hidden />
        <span
          className={cn(
            'absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm',
            status.className,
            'bg-surface/90'
          )}
        >
          {status.label}
        </span>
        {isCompleted ? (
          <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CheckCircle2 className="size-4" aria-hidden />
          </span>
        ) : null}
        <span className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {pct}% complete
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1">
            <Link
              href={`/my-courses/${course.course.id}`}
              className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink transition-colors hover:text-primary"
            >
              {course.course.title}
            </Link>
          </h3>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-subtle">
          {course.course.level ? <span className="capitalize">{course.course.level}</span> : null}
          {course.course.level ? <span aria-hidden>·</span> : null}
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3" aria-hidden />
            {course.completedLessonsCount ?? 0}/{course.totalRequiredLessons ?? '—'} lessons
          </span>
          {lastActive ? (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                {lastActive}
              </span>
            </>
          ) : null}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink-muted">Progress</span>
            <span className={cn('font-bold', isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary')}>
              {pct}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div
              className={cn('h-full rounded-full transition-all duration-700', isCompleted ? 'bg-emerald-500' : 'bg-primary')}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {expires && !isCompleted ? (
          <p className={cn('mt-2 inline-flex items-center gap-1 text-[11px]', isExpired ? 'text-danger' : 'text-ink-subtle')}>
            <CalendarClock className="size-3" aria-hidden />
            {isExpired ? 'Expired on' : 'Expires'} {expires}
          </p>
        ) : null}

        {/* Next lesson hint */}
        {nextLesson && !isExpired ? (
          <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-ink-muted">
            <PlayCircle className="size-3.5 shrink-0 text-primary" aria-hidden />
            <span className="truncate">Next: {nextLesson.title}</span>
          </p>
        ) : null}

        {/* Actions */}
        <div className="mt-4 flex gap-2 border-t border-line pt-4">
          {isExpired ? (
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-ink-subtle">
              <Lock className="size-4" aria-hidden />
              Access expired
            </span>
          ) : (
            <Link
              href={`/my-courses/${course.course.id}${nextLesson?.lessonId ? `?lesson=${nextLesson.lessonId}` : ''}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-fg transition-all hover:bg-primary-hover"
            >
              <PlayCircle className="size-4" aria-hidden />
              {pct > 0 && !isCompleted ? 'Continue' : 'Start'}
            </Link>
          )}
          <Link
            href={`/courses/${course.course.slug}`}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label={`View ${course.course.title} details`}
          >
            View
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
