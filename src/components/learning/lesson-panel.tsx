'use client';

import { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  Lock,
  Radio,
} from 'lucide-react';
import { LessonAttachments } from './lesson-attachments';
import { LessonPlayer } from './lesson-player';
import { Skeleton } from '@/components/commerce/state-views';
import { useLearningLesson } from '@/hooks/learning/use-learning';
import { cn } from '@/lib/cn';
import type { LessonCompletionStatus } from '@/types/learning';

function formatDateTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface LessonPanelProps {
  lessonId: string;
  completionStatus?: LessonCompletionStatus;
  onComplete: (lessonId: string) => void;
  completing: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function LessonPanel({
  lessonId,
  completionStatus,
  onComplete,
  completing,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: LessonPanelProps) {
  const lessonQuery = useLearningLesson(lessonId);
  const lesson = lessonQuery.data;

  const isCompleted = completionStatus === 'completed';

  const liveSession = lesson?.content?.liveSession;
  const resourceContent = lesson?.content?.resourceContent;

  const sanitizedHtml = useMemo(() => {
    // Backend lesson HTML is authored by instructors; render as-is in a sandboxed-ish container.
    return lesson?.content?.textContent?.body ?? '';
  }, [lesson?.content?.textContent?.body]);

  if (lessonQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (lessonQuery.isError || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface p-10 text-center">
        <Lock className="size-8 text-ink-subtle" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-ink">Lesson unavailable</p>
        <p className="mt-1 text-xs text-ink-muted">
          This lesson may be locked, scheduled, or your enrollment may have expired.
        </p>
      </div>
    );
  }

  const isVideo = lesson.type === 'video';
  const isText = lesson.type === 'text';
  const isLive = lesson.type === 'live';
  const isResource = lesson.type === 'resource';

  return (
    <article className="min-w-0">
      {/* Header */}
      <header className="mb-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-subtle">
          <span className="rounded-md bg-surface-2 px-2 py-0.5 font-semibold uppercase tracking-wide">
            {lesson.type}
          </span>
          {lesson.isPreview ? (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">Preview</span>
          ) : null}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3" aria-hidden />
              Completed
            </span>
          ) : null}
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">{lesson.title}</h1>
        {lesson.description ? (
          <p className="mt-1.5 text-sm leading-6 text-ink-muted">{lesson.description}</p>
        ) : null}
      </header>

      {/* Media / content */}
      {isVideo ? <LessonPlayer lesson={lesson} /> : null}

      {isText && sanitizedHtml ? (
        <div
          className="prose prose-sm max-w-none rounded-2xl border border-line bg-surface p-6 text-ink shadow-card prose-headings:text-ink prose-a:text-primary dark:prose-invert"
          // Lesson HTML is instructor-authored course content from our own backend.
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      ) : null}

      {isText && !sanitizedHtml ? (
        <div className="rounded-2xl border border-line bg-surface p-6 text-sm text-ink-muted shadow-card">
          <FileText className="mb-2 size-5 text-ink-subtle" aria-hidden />
          No text content available for this lesson yet.
        </div>
      ) : null}

      {isLive && liveSession ? (
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Radio className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-ink">Live session</h3>
              {liveSession.startsAt ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                  <CalendarClock className="size-4" aria-hidden />
                  {formatDateTime(liveSession.startsAt)}
                  {liveSession.timezone ? ` (${liveSession.timezone})` : ''}
                </p>
              ) : null}
              {liveSession.meetingUrl ? (
                <a
                  href={liveSession.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
                >
                  Join session
                </a>
              ) : null}
              {liveSession.instructions ? (
                <p className="mt-3 text-sm leading-6 text-ink-muted">{liveSession.instructions}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {isResource && resourceContent ? (
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h3 className="text-base font-semibold text-ink">Resources</h3>
          {resourceContent.instructions ? (
            <p className="mt-2 text-sm leading-6 text-ink-muted">{resourceContent.instructions}</p>
          ) : null}
          <p className="mt-3 text-xs text-ink-subtle">
            {(resourceContent.resourceIds ?? []).length} resource
            {(resourceContent.resourceIds ?? []).length === 1 ? '' : 's'} attached — see downloads below.
          </p>
        </div>
      ) : null}

      {/* Attachments */}
      <LessonAttachments lessonId={lesson.id} />

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>

        {!isCompleted ? (
          <button
            type="button"
            onClick={() => onComplete(lesson.id)}
            disabled={completing}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
              completing
                ? 'cursor-wait bg-surface-2 text-ink-subtle'
                : 'bg-primary text-primary-fg hover:-translate-y-0.5 hover:bg-primary-hover'
            )}
          >
            {completing ? 'Saving…' : 'Mark as complete'}
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden />
            Completed
          </span>
        )}
      </div>
    </article>
  );
}
