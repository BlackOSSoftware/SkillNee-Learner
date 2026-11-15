'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { useEnrollFree } from '@/hooks/enrollment/use-enrollment';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import type { CourseDetail } from '@/types/courses';
import { AddToCartButton } from './add-to-cart-button';

function resolveType(course: CourseDetail): 'FREE' | 'PRE_RECORDED' | 'LIVE_SESSION' {
  if (course.courseType) return course.courseType;
  return course.pricing?.type === 'free' ? 'FREE' : 'PRE_RECORDED';
}

/**
 * Course-type-aware enrollment CTA.
 * FREE → direct enroll (no payment). PRE_RECORDED → cart/checkout.
 * LIVE_SESSION → application form. Backend remains source of truth.
 */
export function CourseActionButton({
  course,
  className,
}: {
  course: CourseDetail;
  className?: string;
}) {
  const { status } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const enrollFree = useEnrollFree();

  if (course.enrolled) {
    return (
      <span
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold',
          'bg-success/10 text-success ring-1 ring-inset ring-success/25',
          className
        )}
      >
        <Check className="size-4" aria-hidden />
        Enrolled
      </span>
    );
  }

  const type = resolveType(course);

  if (type === 'LIVE_SESSION') {
    return (
      <Link
        href={`/courses/${course.slug}/apply`}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
          'bg-primary text-primary-fg hover:bg-primary-hover',
          className
        )}
      >
        {course.actionLabel || 'Apply Now'}
      </Link>
    );
  }

  if (type === 'FREE') {
    const handleEnroll = () => {
      if (status !== 'authenticated') {
        router.push(`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);
        return;
      }
      enrollFree.mutate(course.id, {
        onSuccess: () => {
          toast.success('Enrollment successful', 'You now have access to this course.');
        },
        onError: (error) => {
          const normalized = normalizeApiError(error);
          toast.error('Enrollment failed', normalized.message);
        },
      });
    };

    return (
      <button
        type="button"
        onClick={handleEnroll}
        disabled={enrollFree.isPending}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
          'bg-primary text-primary-fg hover:bg-primary-hover',
          className
        )}
      >
        {enrollFree.isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : null}
        {enrollFree.isPending ? 'Enrolling…' : course.actionLabel || 'Enroll Now'}
      </button>
    );
  }

  // PRE_RECORDED → existing cart/checkout flow
  return (
    <AddToCartButton
      courseId={course.id}
      slug={course.slug}
      enrolled={course.enrolled}
      className={className}
    />
  );
}
