'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Compact working month calendar. Highlights today and marks days that have
 * assignment due dates (passed via `markedDates` as YYYY-MM-DD strings).
 */
export function MonthCalendar({ markedDates = [] }: { markedDates?: string[] }) {
  const today = new Date();
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const next = cells.length - firstWeekday - daysInMonth + 1;
    cells.push({ date: new Date(year, month + 1, next), inMonth: false });
  }

  const marked = new Set(markedDates);
  const go = (delta: number) => setView(new Date(year, month + delta, 1));
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="select-none">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          {MONTHS[month]} <span className="font-medium text-ink-subtle">{year}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous month"
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next month"
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
          {!isCurrentMonth ? (
            <button
              type="button"
              onClick={() => setView(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="ml-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Today
            </button>
          ) : null}
        </div>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ date, inMonth }, i) => {
          const isToday = sameDay(date, today);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const hasMark = marked.has(key);
          return (
            <div
              key={i}
              className={cn(
                'relative flex h-8 items-center justify-center rounded-lg text-xs transition-colors',
                inMonth ? 'text-ink' : 'text-ink-subtle/50',
                isToday && 'bg-primary font-bold text-primary-fg',
                !isToday && inMonth && 'hover:bg-surface-2'
              )}
            >
              {date.getDate()}
              {hasMark && !isToday ? (
                <span className="absolute bottom-1 size-1 rounded-full bg-amber-500" aria-label="Has due date" />
              ) : null}
            </div>
          );
        })}
      </div>

      {markedDates.length > 0 ? (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-subtle">
          <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
          Marked days have assignment due dates
        </p>
      ) : null}
    </div>
  );
}
