'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

interface Props {
  expiresAt: string | null;
  timeLimitSeconds: number;
  onExpire?: () => void;
}

export function ExamTimer({ expiresAt, timeLimitSeconds, onExpire }: Props) {
  const initial = (): number | null => {
    if (expiresAt) return new Date(expiresAt).getTime() - Date.now();
    if (timeLimitSeconds > 0) return timeLimitSeconds * 1000;
    return null;
  };

  const [remaining, setRemaining] = useState<number | null>(initial);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (remaining == null) return;
    const t = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev == null) return prev;
        const next = prev - 1000;
        if (next <= 0) {
          window.clearInterval(t);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining == null]);

  if (remaining == null) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-muted">
        No time limit
      </span>
    );
  }

  const urgent = remaining <= 60_000;
  const warning = remaining <= 5 * 60_000;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold tabular-nums',
        urgent
          ? 'border-danger/30 bg-danger/10 text-danger'
          : warning
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-line bg-surface text-ink'
      )}
      role="timer"
      aria-live="off"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9 2h6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {formatRemaining(remaining)}
    </span>
  );
}
