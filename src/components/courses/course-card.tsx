'use client';

import Link from 'next/link';
import { Clock, ShoppingCart, Star, User } from 'lucide-react';
import type { CourseCard } from '@/types/courses';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/cn';

function coursePrice(course: CourseCard): { display: string; original?: string; isFree: boolean } {
  const pricing = course.pricing;
  const currency = pricing?.currency || 'INR';
  if (pricing?.type === 'free') return { display: 'Free', isFree: true };
  const sale = pricing?.salePrice;
  const regular = pricing?.regularPrice;
  if (sale != null && sale > 0) {
    return {
      display: formatMoney(sale, currency),
      original: regular != null && regular > sale ? formatMoney(regular, currency) : undefined,
      isFree: false,
    };
  }
  if (regular != null && regular > 0) {
    return { display: formatMoney(regular, currency), isFree: false };
  }
  return { display: '—', isFree: false };
}

function durationLabel(course: CourseCard): string | null {
  if (course.durationValue == null || !course.durationUnit) return null;
  return `${course.durationValue} ${course.durationUnit}`;
}

function instructorName(course: CourseCard): string | null {
  const names = (course.instructors || [])
    .map((i) => [i.firstName, i.lastName].filter(Boolean).join(' ').trim())
    .filter(Boolean);
  return names.length ? names.join(', ') : null;
}

export function CourseCardView({ course }: { course: CourseCard }) {
  const price = coursePrice(course);
  const duration = durationLabel(course);
  const instructor = instructorName(course);
  const rating = course.rating;
  const hasRating = (rating?.approvedReviewCount ?? 0) > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-shadow duration-200 hover:shadow-pop">
      {/* Thumbnail */}
      <Link href={`/courses/${course.slug}`} className="relative block aspect-video overflow-hidden bg-surface-2">
        {course.thumbnail?.secureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail.secureUrl}
            alt={course.title}
            className="size-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-subtle">
            <ShoppingCart className="size-8 opacity-30" aria-hidden />
          </div>
        )}
        {course.isFeatured ? (
          <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-fg">
            Featured
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-ink-subtle">
          {course.categories?.[0] ? <span className="text-primary">{course.categories[0].name}</span> : null}
          {course.level ? <span className="capitalize">{String(course.level).replace('_', ' ')}</span> : null}
          {course.language ? <span className="uppercase">{course.language}</span> : null}
          {duration ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden />
              {duration}
            </span>
          ) : null}
        </div>

        <Link href={`/courses/${course.slug}`} className="block">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary">
            {course.title}
          </h3>
        </Link>

        {course.shortDescription ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">{course.shortDescription}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="min-w-0">
            {instructor ? (
              <p className="flex items-center gap-1 truncate text-xs text-ink-muted">
                <User className="size-3 shrink-0" aria-hidden />
                {instructor}
              </p>
            ) : null}
            {hasRating ? (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-ink">
                <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                {rating!.averageRating.toFixed(1)}
                <span className="font-normal text-ink-subtle">({rating!.approvedReviewCount})</span>
              </p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            {price.original ? (
              <p className="text-xs text-ink-subtle line-through">{price.original}</p>
            ) : null}
            <p className={cn('text-[15px] font-bold', price.isFree ? 'text-success' : 'text-ink')}>
              {price.display}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
