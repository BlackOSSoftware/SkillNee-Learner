'use client';

import { HelpCircle } from 'lucide-react';
import { QuizzesBrowser } from '@/components/quizzes/quizzes-browser';

export default function QuizzesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-pop">
            <HelpCircle className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Quizzes</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Take timed assessments, review results and track your progress.
            </p>
          </div>
        </div>
      </div>

      <QuizzesBrowser />
    </div>
  );
}
