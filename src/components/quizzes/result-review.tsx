'use client';

import type { QuizResultQuestion } from '@/types/quizzes';
import { questionTypeLabel } from './quiz-display';
import { cn } from '@/lib/cn';

function answerSummary(q: QuizResultQuestion): string {
  const a = q.studentAnswer;
  if (!a) return 'No answer';
  if (a.selectedOptionIds && a.selectedOptionIds.length > 0) {
    const texts = a.selectedOptionIds
      .map((id) => q.options.find((o) => o.id === id)?.text)
      .filter(Boolean);
    return texts.length ? texts.join(', ') : 'Selected option';
  }
  if (typeof a.booleanAnswer === 'boolean') return a.booleanAnswer ? 'True' : 'False';
  if (typeof a.text === 'string' && a.text.trim()) return a.text;
  if (a.blankAnswers && a.blankAnswers.length > 0) {
    return a.blankAnswers.map((b) => b.value || '—').join(', ');
  }
  return 'No answer';
}

function correctSummary(q: QuizResultQuestion): string | null {
  if (!q.correctOptionIds && q.correctAnswer == null && !q.acceptedAnswers?.length) return null;
  if (q.correctOptionIds && q.correctOptionIds.length > 0) {
    const texts = q.correctOptionIds
      .map((id) => q.options.find((o) => o.id === id)?.text)
      .filter(Boolean);
    if (texts.length) return texts.join(', ');
  }
  if (typeof q.correctAnswer === 'boolean') return q.correctAnswer ? 'True' : 'False';
  if (typeof q.correctAnswer === 'string' && q.correctAnswer) return q.correctAnswer;
  if (q.acceptedAnswers && q.acceptedAnswers.length > 0) return q.acceptedAnswers.join(' / ');
  return null;
}

export function ResultReview({ questions }: { questions: QuizResultQuestion[] }) {
  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const correct = q.isCorrect === true;
        const wrong = q.isCorrect === false && !q.needsManualGrading;
        const pending = q.needsManualGrading;
        const correctText = correctSummary(q);
        return (
          <div
            key={q.id}
            className={cn(
              'rounded-2xl border bg-surface p-5 shadow-card',
              correct ? 'border-emerald-200' : wrong ? 'border-rose-200' : 'border-line'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                    correct
                      ? 'bg-emerald-100 text-emerald-700'
                      : wrong
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-surface-2 text-ink-muted'
                  )}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                    {questionTypeLabel(q.questionType)} · {q.marks} marks
                  </p>
                  <h4 className="mt-1 whitespace-pre-wrap text-sm font-medium leading-6 text-ink">
                    {q.questionText}
                  </h4>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-bold',
                    correct
                      ? 'bg-emerald-100 text-emerald-700'
                      : wrong
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-surface-2 text-ink-muted'
                  )}
                >
                  {pending ? 'Pending' : correct ? 'Correct' : wrong ? 'Incorrect' : '—'}
                </span>
                {q.marksAwarded != null ? (
                  <span className="text-xs font-semibold text-ink-muted">
                    {q.marksAwarded}/{q.marks}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-2/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Your answer
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{answerSummary(q)}</p>
              </div>
              {correctText ? (
                <div className="rounded-xl bg-emerald-50/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                    Correct answer
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{correctText}</p>
                </div>
              ) : null}
            </div>

            {q.explanation ? (
              <div className="mt-3 rounded-xl bg-sky-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">
                  Explanation
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{q.explanation}</p>
              </div>
            ) : null}
            {q.feedback ? (
              <div className="mt-3 rounded-xl bg-amber-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  Feedback
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{q.feedback}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
