'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  ListVideo,
  Lock,
  X,
} from 'lucide-react';
import { CurriculumSidebar } from '@/components/learning/curriculum-sidebar';
import { LessonPanel } from '@/components/learning/lesson-panel';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import { useCompleteLesson, useCourseProgress, useLearningCurriculum } from '@/hooks/learning/use-learning';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import type { LearningLesson, LessonCompletionStatus } from '@/types/learning';

function WorkspaceInner() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = params.courseId;
  const { status } = useAuth();
  const toast = useToast();
  const authed = status === 'authenticated';

  const progressQuery = useCourseProgress(courseId, authed);
  const curriculumQuery = useLearningCurriculum(courseId, authed);
  const completeLesson = useCompleteLesson(courseId);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    () => searchParams.get('lesson')
  );
  const [curriculumOpen, setCurriculumOpen] = useState(false);

  const curriculum = curriculumQuery.data;
  const progress = progressQuery.data;

  // Flatten curriculum into ordered lesson list for prev/next navigation.
  const flatLessons = useMemo<LearningLesson[]>(() => {
    if (!curriculum) return [];
    return curriculum.topics.flatMap((t) => t.lessons);
  }, [curriculum]);

  // Completion map from the authoritative progress endpoint (required lessons).
  const completionByLesson = useMemo(() => {
    const map = new Map<string, LessonCompletionStatus>();
    for (const l of progress?.lessons ?? []) {
      map.set(l.lessonId, l.completionStatus);
    }
    return map;
  }, [progress?.lessons]);

  // Default selection: explicit ?lesson= → next incomplete → first unlocked lesson.
  const effectiveLessonId = useMemo(() => {
    if (selectedLessonId && flatLessons.some((l) => l.id === selectedLessonId && !l.locked)) {
      return selectedLessonId;
    }
    const nextId = progress?.nextIncompleteLesson?.lessonId;
    if (nextId && flatLessons.some((l) => l.id === nextId)) return nextId;
    const first = flatLessons.find((l) => !l.locked);
    return first?.id ?? null;
  }, [selectedLessonId, flatLessons, progress?.nextIncompleteLesson?.lessonId]);

  const selectedIndex = flatLessons.findIndex((l) => l.id === effectiveLessonId);
  const prevLesson = selectedIndex > 0 ? flatLessons[selectedIndex - 1] : null;
  const nextLesson =
    selectedIndex >= 0 && selectedIndex < flatLessons.length - 1 ? flatLessons[selectedIndex + 1] : null;

  const handleSelect = (lesson: LearningLesson) => {
    setSelectedLessonId(lesson.id);
    setCurriculumOpen(false);
  };

  const handleComplete = (lessonId: string) => {
    completeLesson.mutate(
      { lessonId },
      {
        onSuccess: (result) => {
          if (result.alreadyCompleted) {
            toast.notify({ tone: 'info', title: 'Lesson already completed' });
          } else {
            toast.success('Lesson completed', `${result.course.title} · ${Math.round(result.progress.progressPercentage)}%`);
          }
        },
        onError: (e) => toast.error('Could not complete lesson', normalizeApiError(e).message),
      }
    );
  };

  /* ---------- Loading ---------- */
  if (status === 'loading' || curriculumQuery.isPending || progressQuery.isPending) {
    return (
      <div className="mx-auto max-w-7xl">
        <Skeleton className="mb-6 h-24 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  /* ---------- Errors ---------- */
  if (status !== 'authenticated') {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<Lock className="size-6" aria-hidden />}
          title="Sign in to continue learning"
          description="The learning workspace requires an authenticated student session."
          action={
            <Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  if (curriculumQuery.isError || progressQuery.isError || !curriculum || !progress) {
    const denied =
      (curriculumQuery.error as { response?: { status?: number } } | null)?.response?.status === 403 ||
      (progressQuery.error as { response?: { status?: number } } | null)?.response?.status === 403;
    return (
      <div className="mx-auto max-w-3xl">
        {denied ? (
          <EmptyState
            icon={<Lock className="size-6" aria-hidden />}
            title="Access unavailable"
            description="Your enrollment may have expired or been revoked for this course."
            action={
              <Link href="/my-courses" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
                Back to My Courses
              </Link>
            }
          />
        ) : (
          <ErrorState
            title="Could not load this course"
            description="Please try again in a moment."
            onRetry={() => {
              void curriculumQuery.refetch();
              void progressQuery.refetch();
            }}
            retrying={curriculumQuery.isFetching || progressQuery.isFetching}
          />
        )}
      </div>
    );
  }

  const pct = Math.round(progress.progressPercentage || 0);
  const isCompleted = progress.courseCompletionStatus === 'completed';
  const accessGranted = progress.accessGranted !== false;

  return (
    <div className="mx-auto max-w-7xl animate-page-enter">
      {/* Course header */}
      <div className="animate-card-enter mb-6">
        <Link
          href="/my-courses"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          My Courses
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 shrink-0 text-primary" aria-hidden />
              <h2 className="truncate text-lg font-bold tracking-tight text-ink sm:text-xl">
                {curriculum.course.title}
              </h2>
              {isCompleted ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" aria-hidden />
                  Completed
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', isCompleted ? 'bg-emerald-500' : 'bg-primary')}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-bold text-ink">{pct}%</span>
            </div>
            <p className="mt-1.5 text-xs text-ink-subtle">
              {progress.completedLessonsCount}/{progress.totalRequiredLessons} required lessons
              {progress.enrollmentStatus ? ` · ${progress.enrollmentStatus}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurriculumOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 lg:hidden"
          >
            <ListVideo className="size-4" aria-hidden />
            Curriculum
          </button>
        </div>
      </div>

      {!accessGranted ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          Your enrollment is read-only — learning access is currently restricted.
        </div>
      ) : null}

      {/* Workspace grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main lesson area */}
        <main className="min-w-0">
          {effectiveLessonId ? (
            <LessonPanel
              key={effectiveLessonId}
              lessonId={effectiveLessonId}
              completionStatus={completionByLesson.get(effectiveLessonId)}
              onComplete={handleComplete}
              completing={completeLesson.isPending}
              onPrev={prevLesson && !prevLesson.locked ? () => handleSelect(prevLesson) : undefined}
              onNext={nextLesson && !nextLesson.locked ? () => handleSelect(nextLesson) : undefined}
              hasPrev={Boolean(prevLesson && !prevLesson.locked)}
              hasNext={Boolean(nextLesson && !nextLesson.locked)}
            />
          ) : (
            <EmptyState
              icon={<ListVideo className="size-6" aria-hidden />}
              title="No lessons available"
              description="This course does not have any published lessons yet."
            />
          )}
        </main>

        {/* Curriculum sidebar — desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <CurriculumSidebar
              curriculum={curriculum}
              selectedLessonId={effectiveLessonId}
              onSelectLesson={handleSelect}
              completionByLesson={completionByLesson}
            />
          </div>
        </aside>
      </div>

      {/* Mobile curriculum drawer */}
      {curriculumOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Course curriculum">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setCurriculumOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-surface shadow-2xl animate-[dialog-in_200ms_ease-out]">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h3 className="text-sm font-semibold text-ink">Curriculum</h3>
              <button
                type="button"
                onClick={() => setCurriculumOpen(false)}
                aria-label="Close curriculum"
                className="rounded-lg p-2 text-ink-muted hover:bg-surface-2"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CurriculumSidebar
                curriculum={curriculum}
                selectedLessonId={effectiveLessonId}
                onSelectLesson={handleSelect}
                completionByLesson={completionByLesson}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CourseWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      }
    >
      <WorkspaceInner />
    </Suspense>
  );
}
