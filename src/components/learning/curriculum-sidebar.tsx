'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Lock,
  PlayCircle,
  Radio,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { LearningCurriculum, LearningLesson, LearningTopic } from '@/types/learning';
import type { LessonCompletionStatus } from '@/types/learning';

const TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  text: FileText,
  live: Radio,
  resource: FileText,
  quiz: FileText,
  assignment: FileText,
};

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface CurriculumSidebarProps {
  curriculum: LearningCurriculum;
  selectedLessonId: string | null;
  onSelectLesson: (lesson: LearningLesson) => void;
  completionByLesson: Map<string, LessonCompletionStatus>;
}

export function CurriculumSidebar({
  curriculum,
  selectedLessonId,
  onSelectLesson,
  completionByLesson,
}: CurriculumSidebarProps) {
  // Auto-expand the topic containing the selected lesson; others collapsed by default
  const [openTopics, setOpenTopics] = useState<Set<string>>(() => {
    const set = new Set<string>();
    for (const t of curriculum.topics) {
      if (t.lessons.some((l) => l.id === selectedLessonId)) set.add(t.id);
    }
    return set;
  });

  const toggleTopic = (id: string) => {
    setOpenTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLessons = curriculum.topics.reduce((n, t) => n + t.lessons.length, 0);
  const completedCount = curriculum.topics.reduce(
    (n, t) => n + t.lessons.filter((l) => completionByLesson.get(l.id) === 'completed').length,
    0
  );

  return (
    <div className="flex h-full flex-col">
      {/* Course summary */}
      <div className="border-b border-line px-4 py-4">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
          {curriculum.course.title}
        </h2>
        <p className="mt-1 text-xs text-ink-subtle">
          {completedCount}/{totalLessons} lessons completed
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${totalLessons ? (completedCount / totalLessons) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Topics */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Course curriculum">
        {curriculum.topics.map((topic: LearningTopic, ti: number) => {
          const open = openTopics.has(topic.id);
          const topicCompleted = topic.lessons.filter(
            (l) => completionByLesson.get(l.id) === 'completed'
          ).length;
          return (
            <div key={topic.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <ChevronDown
                  className={cn('size-4 shrink-0 text-ink-subtle transition-transform', !open && '-rotate-90')}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-ink">
                    {ti + 1}. {topic.title}
                  </span>
                  <span className="text-[11px] text-ink-subtle">
                    {topicCompleted}/{topic.lessons.length} lessons
                  </span>
                </span>
              </button>

              {open ? (
                <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-line pl-2">
                  {topic.lessons.map((lesson) => {
                    const Icon = TYPE_ICONS[lesson.type] ?? FileText;
                    const isSelected = lesson.id === selectedLessonId;
                    const completed = completionByLesson.get(lesson.id) === 'completed';
                    const locked = lesson.locked;
                    const duration = formatDuration(lesson.durationSeconds);
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          onClick={() => !locked && onSelectLesson(lesson)}
                          disabled={locked}
                          aria-current={isSelected ? 'true' : undefined}
                          className={cn(
                            'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : locked
                                ? 'cursor-not-allowed text-ink-subtle/60'
                                : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                          )}
                        >
                          {completed ? (
                            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" aria-hidden />
                          ) : locked ? (
                            <Lock className="size-4 shrink-0" aria-hidden />
                          ) : isSelected ? (
                            <PlayCircle className="size-4 shrink-0" aria-hidden />
                          ) : (
                            <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className={cn('block truncate text-[13px]', isSelected && 'font-semibold')}>
                              {lesson.title}
                            </span>
                            {duration ? (
                              <span className="text-[11px] text-ink-subtle">{duration}</span>
                            ) : null}
                          </span>
                          {lesson.isPreview && !locked ? (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                              Preview
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
