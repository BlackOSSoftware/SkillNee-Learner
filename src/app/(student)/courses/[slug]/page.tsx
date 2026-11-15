'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Globe,
  GraduationCap,
  Layers,
  ListChecks,
  Lock,
  Star,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { CourseActionButton } from '@/components/courses/course-action-button';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { useCourseCurriculum, useCourseDetail } from '@/hooks/courses/use-courses';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { CurriculumTopic, CourseDetail as CourseDetailType } from '@/types/courses';

function priceInfo(course: CourseDetailType) {
  const pricing = course.pricing;
  const currency = pricing?.currency || 'INR';
  if (pricing?.type === 'free') return { isFree: true, display: 'Free', original: null as string | null };
  const sale = pricing?.salePrice;
  const regular = pricing?.regularPrice;
  if (sale != null && sale > 0) {
    return {
      isFree: false,
      display: formatMoney(sale, currency),
      original: regular != null && regular > sale ? formatMoney(regular, currency) : null,
    };
  }
  if (regular != null && regular > 0) {
    return { isFree: false, display: formatMoney(regular, currency), original: null };
  }
  return { isFree: false, display: '—', original: null };
}

function durationLabel(course: CourseDetailType): string | null {
  if (course.durationValue == null || !course.durationUnit) return null;
  return `${course.durationValue} ${course.durationUnit}`;
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
      <span className="text-ink-subtle">{icon}</span>
      {children}
    </span>
  );
}

function CurriculumSection({ topic, defaultOpen }: { topic: CurriculumTopic; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 bg-surface-2/60 px-4 py-3 text-left transition-colors hover:bg-surface-2"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          {topic.locked ? (
            <Lock className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          ) : (
            <BookOpen className="size-4 shrink-0 text-primary" aria-hidden />
          )}
          <span>
            <span className="block text-sm font-semibold text-ink">{topic.title}</span>
            {topic.description ? (
              <span className="mt-0.5 block text-xs text-ink-muted">{topic.description}</span>
            ) : null}
          </span>
        </span>
        <span className="flex items-center gap-2 text-xs text-ink-subtle">
          {topic.lessons.length} lesson{topic.lessons.length === 1 ? '' : 's'}
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
        </span>
      </button>
      {open ? (
        <ul className="divide-y divide-line bg-surface">
          {topic.lessons.map((lesson) => (
            <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
              {lesson.locked ? (
                <Lock className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
              ) : lesson.isPreview ? (
                <span className="size-1.5 shrink-0 rounded-full bg-success" aria-hidden />
              ) : (
                <CheckCircle2 className="size-3.5 shrink-0 text-ink-subtle" aria-hidden />
              )}
              <span className={cn('flex-1 truncate text-sm', lesson.locked ? 'text-ink-subtle' : 'text-ink')}>
                {lesson.title}
              </span>
              {lesson.isPreview ? (
                <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-success">
                  Preview
                </span>
              ) : null}
              {lesson.durationSeconds ? (
                <span className="text-xs text-ink-subtle">
                  {Math.max(1, Math.round(lesson.durationSeconds / 60))} min
                </span>
              ) : null}
            </li>
          ))}
          {topic.lessons.length === 0 ? (
            <li className="px-4 py-3 text-sm text-ink-subtle">No lessons available.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';
  const courseQuery = useCourseDetail(slug);
  const curriculumQuery = useCourseCurriculum(slug, Boolean(courseQuery.data));

  if (courseQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Course not found"
          description="This course may have been removed or is no longer published."
          onRetry={() => courseQuery.refetch()}
          retrying={courseQuery.isFetching}
        />
        <p className="mt-4 text-center">
          <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
            ← Back to all courses
          </Link>
        </p>
      </div>
    );
  }

  const course = courseQuery.data;
  const price = priceInfo(course);
  const duration = durationLabel(course);
  const rating = course.rating;
  const hasRating = (rating?.approvedReviewCount ?? 0) > 0;
  const curriculum = curriculumQuery.data;
  const totalLessons = curriculum?.topics.reduce((n, t) => n + t.lessons.length, 0) ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-ink-muted" aria-label="Breadcrumb">
        <Link href="/courses" className="hover:text-primary">Courses</Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">{course.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              {course.categories?.map((c) => (
                <span key={c.id} className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                  {c.name}
                </span>
              ))}
              {course.isFeatured ? (
                <span className="rounded-full bg-warning/10 px-2.5 py-1 text-warning">Featured</span>
              ) : null}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{course.title}</h2>
            {course.shortDescription ? (
              <p className="mt-2 text-base text-ink-muted">{course.shortDescription}</p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {hasRating ? (
                <MetaItem icon={<Star className="size-4 fill-warning text-warning" aria-hidden />}>
                  {rating!.averageRating.toFixed(1)} · {rating!.approvedReviewCount} review
                  {rating!.approvedReviewCount === 1 ? '' : 's'}
                </MetaItem>
              ) : null}
              {duration ? <MetaItem icon={<Clock className="size-4" aria-hidden />}>{duration}</MetaItem> : null}
              {course.language ? (
                <MetaItem icon={<Globe className="size-4" aria-hidden />}>{course.language.toUpperCase()}</MetaItem>
              ) : null}
              {course.level ? (
                <MetaItem icon={<GraduationCap className="size-4" aria-hidden />}>
                  <span className="capitalize">{String(course.level).replace('_', ' ')}</span>
                </MetaItem>
              ) : null}
              {totalLessons > 0 ? (
                <MetaItem icon={<ListChecks className="size-4" aria-hidden />}>
                  {totalLessons} lesson{totalLessons === 1 ? '' : 's'}
                </MetaItem>
              ) : null}
            </div>

            {/* Instructors */}
            {(course.instructors?.length ?? 0) > 0 ? (
              <div className="mt-5 flex flex-wrap gap-4">
                {course.instructors!.map((inst) => (
                  <div key={inst.id} className="flex items-center gap-2.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {inst.profileImage?.secureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={inst.profileImage.secureUrl} alt="" className="size-9 rounded-full object-cover" />
                      ) : (
                        <User className="size-4" aria-hidden />
                      )}
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {[inst.firstName, inst.lastName].filter(Boolean).join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Banner / thumbnail */}
          {course.thumbnail?.secureUrl || (course.gallery?.length ?? 0) > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.thumbnail?.secureUrl ?? course.gallery![0].secureUrl}
                alt={course.title}
                className="aspect-video w-full object-cover"
              />
            </div>
          ) : null}

          {/* Description */}
          {course.description ? (
            <section>
              <h3 className="mb-3 text-lg font-semibold text-ink">About this course</h3>
              <div className="lesson-html text-sm leading-relaxed text-ink-muted" dangerouslySetInnerHTML={{ __html: course.description }} />
            </section>
          ) : null}

          {/* Learning objectives */}
          {(course.learningObjectives?.length ?? 0) > 0 ? (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink">
                <Award className="size-5 text-primary" aria-hidden />
                What you will learn
              </h3>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {course.learningObjectives!.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-3.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-ink">{obj.title}</p>
                      {obj.description ? <p className="mt-0.5 text-xs text-ink-muted">{obj.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Requirements */}
          {(course.requirements?.length ?? 0) > 0 ? (
            <section>
              <h3 className="mb-3 text-lg font-semibold text-ink">Requirements</h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
                {course.requirements!.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Target audience */}
          {(course.targetAudience?.length ?? 0) > 0 ? (
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink">
                <Users className="size-5 text-primary" aria-hidden />
                Who this course is for
              </h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
                {course.targetAudience!.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Curriculum */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink">
              <Layers className="size-5 text-primary" aria-hidden />
              Curriculum
              {curriculumQuery.isPending ? <Skeleton className="h-4 w-16" /> : null}
            </h3>
            {curriculumQuery.isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : curriculumQuery.isError || !curriculum ? (
              <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">
                Curriculum is unavailable right now.
              </p>
            ) : curriculum.topics.length === 0 ? (
              <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-muted">
                No curriculum published yet.
              </p>
            ) : (
              <div className="space-y-3">
                {curriculum.topics.map((topic, i) => (
                  <CurriculumSection key={topic.id} topic={topic} defaultOpen={i === 0} />
                ))}
              </div>
            )}
          </section>

          {/* FAQs */}
          {(course.faqs?.length ?? 0) > 0 ? (
            <section>
              <h3 className="mb-3 text-lg font-semibold text-ink">Frequently asked questions</h3>
              <div className="space-y-3">
                {course.faqs!.map((faq, i) => (
                  <details key={i} className="group rounded-xl border border-line bg-surface p-4">
                    <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-ink">
                      {faq.question}
                      <ChevronDown className="size-4 text-ink-subtle transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          {/* Reviews */}
          {(course.reviews?.length ?? 0) > 0 ? (
            <section>
              <h3 className="mb-3 text-lg font-semibold text-ink">Student reviews</h3>
              <div className="space-y-3">
                {course.reviews!.slice(0, 5).map((review) => (
                  <div key={review.id} className="rounded-xl border border-line bg-surface p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'size-3.5',
                              i < review.rating ? 'fill-warning text-warning' : 'text-line'
                            )}
                            aria-hidden
                          />
                        ))}
                      </div>
                      {review.title ? <span className="text-sm font-semibold text-ink">{review.title}</span> : null}
                    </div>
                    {review.comment ? <p className="mt-2 text-sm text-ink-muted">{review.comment}</p> : null}
                    {review.student ? (
                      <p className="mt-2 text-xs text-ink-subtle">
                        {[review.student.firstName, review.student.lastName].filter(Boolean).join(' ')}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* Sticky purchase card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            {course.thumbnail?.secureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.thumbnail.secureUrl} alt="" className="aspect-video w-full object-cover" />
            ) : null}
            <div className="space-y-4 p-5">
              <div>
                {price.original ? (
                  <p className="text-sm text-ink-subtle line-through">{price.original}</p>
                ) : null}
                <p className={cn('text-2xl font-bold', price.isFree ? 'text-success' : 'text-ink')}>
                  {price.display}
                </p>
                {course.pricing?.currency && !price.isFree ? (
                  <p className="text-xs text-ink-subtle">{course.pricing.currency}</p>
                ) : null}
              </div>

              <CourseActionButton course={course} className="w-full" />

              {course.enrolled ? (
                <Link
                  href="/my-courses"
                  className="block rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:bg-line/60"
                >
                  Continue learning
                </Link>
              ) : null}

              <ul className="space-y-2.5 border-t border-line pt-4 text-sm text-ink-muted">
                {duration ? (
                  <li className="flex items-center gap-2.5">
                    <Clock className="size-4 text-ink-subtle" aria-hidden /> {duration}
                  </li>
                ) : null}
                {totalLessons > 0 ? (
                  <li className="flex items-center gap-2.5">
                    <ListChecks className="size-4 text-ink-subtle" aria-hidden /> {totalLessons} lessons
                  </li>
                ) : null}
                {course.certificate?.enabled ? (
                  <li className="flex items-center gap-2.5">
                    <Award className="size-4 text-ink-subtle" aria-hidden /> Certificate on completion
                  </li>
                ) : null}
                {course.language ? (
                  <li className="flex items-center gap-2.5">
                    <Globe className="size-4 text-ink-subtle" aria-hidden /> {course.language.toUpperCase()}
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
