'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Flame,
  GraduationCap,
  HelpCircle,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { MonthCalendar } from '@/components/dashboard/month-calendar';
import { Skeleton } from '@/components/commerce/state-views';
import { useMyCourses, useStudentDashboard } from '@/hooks/enrollment/use-enrollment';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/cn';
import type { MyCourse } from '@/types/enrollment';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function initials(user: { firstName?: string; lastName?: string; email?: string } | null): string {
  if (!user) return 'S';
  const a = user.firstName?.[0] ?? '';
  const b = user.lastName?.[0] ?? user.email?.[0] ?? '';
  return (a + b).toUpperCase() || 'S';
}

/* ---------- Progress ring ---------- */
function ProgressRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={5} className="stroke-surface-2" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={5}
        strokeLinecap="round"
        className="stroke-primary transition-all duration-700"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
      />
    </svg>
  );
}

/* ---------- Stat card ---------- */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  accent,
  delay,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: typeof BookOpen;
  href: string;
  accent: string;
  delay: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'animate-card-enter group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-pop',
        delay
      )}
    >
      <div
        className={cn('absolute -right-8 -top-8 size-28 rounded-full opacity-[0.08] blur-2xl transition-opacity group-hover:opacity-[0.16]', accent)}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <span className={cn('flex size-11 items-center justify-center rounded-xl text-white shadow-sm', accent)}>
          <Icon className="size-5" aria-hidden />
        </span>
        <ArrowRight className="size-4 text-ink-subtle transition-all group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </div>
      <p className="relative mt-4 text-[28px] font-bold leading-none tracking-tight text-ink">{value}</p>
      <p className="relative mt-1.5 text-sm font-medium text-ink-muted">{label}</p>
      {sub ? <p className="relative mt-0.5 text-xs text-ink-subtle">{sub}</p> : null}
    </Link>
  );
}

/* ---------- Course thumb ---------- */
function CourseThumb({ course }: { course: MyCourse['course'] }) {
  const url = course.thumbnail?.secureUrl || course.thumbnail?.url;
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
    );
  }
  return (
    <span className="flex size-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 text-primary">
      <GraduationCap className="size-7" aria-hidden />
    </span>
  );
}

/* ---------- Section header ---------- */
function SectionHeader({ title, href, linkLabel = 'View all' }: { title: string; href: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-base font-semibold tracking-tight text-ink">{title}</h3>
      <Link href={href} className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        {linkLabel}
        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user, status } = useAuth();
  const [now] = useState(() => Date.now());
  const authed = status === 'authenticated';
  const dashboardQuery = useStudentDashboard(authed);
  const myCoursesQuery = useMyCourses('in_progress', authed);

  const firstName = user?.firstName ?? '';
  const dashboard = dashboardQuery.data;
  const totals = dashboard?.totals;
  const inProgress = myCoursesQuery.data?.courses ?? [];
  const upcoming = dashboard?.upcomingAssignments ?? [];
  const pendingQuizzes = dashboard?.pendingRequiredQuizzes ?? 0;
  const pendingEvals = dashboard?.pendingAssignmentEvaluations ?? 0;
  const markedDates = upcoming
    .map((a) => a.dueDate)
    .filter((d): d is string => Boolean(d))
    .map((d) => new Date(d).toISOString().slice(0, 10));

  return (
    <div className="mx-auto max-w-6xl animate-page-enter">
      {/* ===== Hero ===== */}
      <div className="animate-card-enter relative mb-8 overflow-hidden rounded-3xl border border-line shadow-card">
        {/* gradient backdrop */}
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary/90 to-[#0e7490]" aria-hidden />
        <div
          className="absolute -right-20 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-28 right-40 size-64 rounded-full bg-black/10 blur-3xl"
          aria-hidden
        />
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-primary-fg/80">
              <Sparkles className="size-4" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">{todayLabel()}</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-[32px] sm:leading-tight">
              {greeting()}
              {firstName ? `, ${firstName}` : ''}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">
              {totals && totals.enrolledCourses > 0
                ? `You're making progress — ${totals.inProgressCourses} course${totals.inProgressCourses === 1 ? '' : 's'} in progress, ${totals.completedCourses} completed. Keep the streak alive.`
                : 'Your learning journey starts here. Explore the catalog and enroll in your first course.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <BookOpen className="size-4" aria-hidden />
                Browse courses
              </Link>
              <Link
                href="/my-courses"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
              >
                <GraduationCap className="size-4" aria-hidden />
                My courses
              </Link>
            </div>
          </div>

          {/* Avatar + mini summary */}
          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold text-white ring-2 ring-white/30 backdrop-blur">
              {initials(user)}
            </div>
            {totals ? (
              <div className="flex gap-5 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur sm:text-right">
                <div>
                  <p className="text-xl font-bold text-white">{totals.enrolledCourses}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">Enrolled</p>
                </div>
                <div className="w-px bg-white/20" aria-hidden />
                <div>
                  <p className="text-xl font-bold text-white">{totals.completedCourses}</p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">Done</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ===== Stats ===== */}
      {dashboardQuery.isPending ? (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : totals ? (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Enrolled"
            value={totals.enrolledCourses}
            sub="total courses"
            icon={BookOpen}
            href="/my-courses"
            accent="bg-sky-500"
            delay="animate-card-enter-1"
          />
          <StatCard
            label="In progress"
            value={totals.inProgressCourses}
            sub="actively learning"
            icon={PlayCircle}
            href="/my-courses"
            accent="bg-violet-500"
            delay="animate-card-enter-2"
          />
          <StatCard
            label="Completed"
            value={totals.completedCourses}
            sub="courses finished"
            icon={CheckCircle2}
            href="/my-courses"
            accent="bg-emerald-500"
            delay="animate-card-enter-3"
          />
          <StatCard
            label="Pending quizzes"
            value={pendingQuizzes}
            sub={pendingEvals > 0 ? `${pendingEvals} eval pending` : 'all caught up'}
            icon={HelpCircle}
            href="/quizzes"
            accent="bg-amber-500"
            delay="animate-card-enter-4"
          />
        </div>
      ) : null}

      {/* ===== Main grid ===== */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Continue learning */}
        <section className="animate-card-enter animate-card-enter-2 min-w-0">
          <SectionHeader title="Continue learning" href="/my-courses" />

          {myCoursesQuery.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : inProgress.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-line bg-surface-2/50 p-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="size-7" aria-hidden />
              </div>
              <p className="mt-4 text-base font-semibold text-ink">No courses in progress yet</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">
                Enroll in a course and it will appear here with your progress, next lesson and streak.
              </p>
              <Link
                href="/courses"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
              >
                Explore courses
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {inProgress.slice(0, 5).map((enrollment) => {
                const pct = Math.round(enrollment.progressPercentage || 0);
                return (
                  <li key={enrollment.enrollmentId}>
                    <Link
                      href={`/courses/${enrollment.course.slug}`}
                      className="group flex gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop"
                    >
                      <span className="relative h-[72px] w-28 shrink-0 overflow-hidden rounded-xl">
                        <CourseThumb course={enrollment.course} />
                        <span className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" aria-hidden />
                        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                          {pct}%
                        </span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-ink transition-colors group-hover:text-primary">
                              {enrollment.course.title}
                            </span>
                            <span className="mt-0.5 block text-xs capitalize text-ink-subtle">
                              {enrollment.course.level || 'Course'}
                              {enrollment.course.pricing?.pricingType ? ` · ${enrollment.course.pricing.pricingType}` : ''}
                            </span>
                          </span>
                          <span className="relative shrink-0">
                            <ProgressRing value={pct} />
                          </span>
                        </span>
                        <span className="mt-auto flex items-center justify-between gap-3 pt-2 text-xs text-ink-subtle">
                          <span>
                            {enrollment.completedLessonsCount ?? 0} / {enrollment.totalRequiredLessons ?? '—'} lessons
                          </span>
                          {enrollment.nextIncompleteLesson?.title ? (
                            <span className="flex min-w-0 items-center gap-1 text-primary">
                              <PlayCircle className="size-3.5 shrink-0" aria-hidden />
                              <span className="truncate">{enrollment.nextIncompleteLesson.title}</span>
                            </span>
                          ) : (
                            <span className="text-ink-subtle">Review course</span>
                          )}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ===== Right rail ===== */}
        <div className="space-y-6">
          {/* Calendar */}
          <section className="animate-card-enter animate-card-enter-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h3 className="mb-4 text-base font-semibold tracking-tight text-ink">Calendar</h3>
            <MonthCalendar markedDates={markedDates} />
          </section>

          {/* Upcoming assignments */}
          <section className="animate-card-enter animate-card-enter-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <SectionHeader title="Upcoming assignments" href="/assignments" linkLabel="All" />
            {dashboardQuery.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="rounded-xl bg-surface-2/60 px-4 py-5 text-center">
                <CalendarClock className="mx-auto size-6 text-ink-subtle" aria-hidden />
                <p className="mt-2 text-sm text-ink-muted">No upcoming assignments.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {upcoming.slice(0, 4).map((a) => {
                  const due = a.dueDate ? new Date(a.dueDate) : null;
                  const soon = due && due.getTime() - now < 3 * 24 * 3600 * 1000;
                  return (
                    <li key={a.id}>
                      <Link
                        href="/assignments"
                        className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-line hover:bg-surface-2/60"
                      >
                        <span
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg',
                            soon ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'
                          )}
                        >
                          <ClipboardList className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{a.title}</span>
                          {due ? (
                            <span className={cn('text-xs', soon ? 'font-semibold text-amber-600' : 'text-ink-subtle')}>
                              Due {due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {soon ? ' · soon' : ''}
                            </span>
                          ) : null}
                        </span>
                        <ChevronRight className="size-4 text-ink-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {pendingEvals > 0 ? (
              <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                {pendingEvals} submission{pendingEvals === 1 ? '' : 's'} awaiting evaluation
              </p>
            ) : null}
          </section>

          {/* Activity / pending */}
          <section className="animate-card-enter animate-card-enter-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h3 className="mb-4 text-base font-semibold tracking-tight text-ink">Needs attention</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/quizzes"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2/60"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="size-4 text-violet-500" aria-hidden />
                    <span className="text-sm text-ink">Pending quizzes</span>
                  </span>
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                    {pendingQuizzes}
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/assignments"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2/60"
                >
                  <span className="flex items-center gap-3">
                    <ClipboardList className="size-4 text-amber-500" aria-hidden />
                    <span className="text-sm text-ink">Evaluations pending</span>
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    {pendingEvals}
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/certificates"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2/60"
                >
                  <span className="flex items-center gap-3">
                    <Award className="size-4 text-emerald-500" aria-hidden />
                    <span className="text-sm text-ink">Certificates</span>
                  </span>
                  <ChevronRight className="size-4 text-ink-subtle" aria-hidden />
                </Link>
              </li>
            </ul>
          </section>

          {/* Streak / motivation card */}
          <section className="animate-card-enter animate-card-enter-4 relative overflow-hidden rounded-2xl border border-line bg-linear-to-br from-amber-500/10 via-surface to-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                <Flame className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">Keep your momentum</p>
                <p className="text-xs text-ink-muted">
                  {totals && totals.completedRequiredLessons > 0
                    ? `${totals.completedRequiredLessons} lessons completed — every lesson counts.`
                    : 'Complete your first lesson to start building momentum.'}
                </p>
              </div>
            </div>
            <Link
              href="/my-courses"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              Continue learning
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
