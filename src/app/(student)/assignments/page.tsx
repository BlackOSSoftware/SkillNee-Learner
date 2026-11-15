'use client';

import { useState } from 'react';
import { ClipboardList, FileCheck2, Hourglass, ListChecks, RefreshCw } from 'lucide-react';
import { useAssignmentStats } from '@/hooks/assignments/use-assignments';
import { AssignmentsBrowser } from '@/components/assignments/assignments-browser';
import { MySubmissionsBrowser } from '@/components/assignments/my-submissions-browser';
import { Skeleton } from '@/components/commerce/state-views';
import { cn } from '@/lib/cn';

type Tab = 'assignments' | 'submissions';

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: number | null;
  loading: boolean;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-pop">
      <div
        className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80', accent)}
        aria-hidden
      />
      <div className="flex items-center gap-3.5">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-105',
            accent
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-1.5 h-7 w-12" />
          ) : (
            <p className="text-2xl font-bold tabular-nums tracking-tight text-ink">
              {value ?? '—'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const [tab, setTab] = useState<Tab>('assignments');
  const [refreshKey, setRefreshKey] = useState(0);

  // Stats come from real backend counts (see useAssignmentStats).
  const stats = useAssignmentStats();

  const refresh = () => {
    setRefreshKey((k) => k + 1);
    stats.refetch();
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary/10 via-surface to-surface p-5 shadow-card sm:p-6">
        <div
          className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-pop">
              <ClipboardList className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink">Assignments</h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Track your coursework, submit assignments and review instructor feedback.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface/80 px-4 text-sm font-semibold text-ink backdrop-blur transition-all hover:bg-surface hover:shadow-pop"
          >
            <RefreshCw className="size-4" aria-hidden />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Total assignments" value={stats.total} loading={stats.loading} accent="from-sky-500 to-blue-600" />
        <StatCard icon={Hourglass} label="Pending" value={stats.pending} loading={stats.loading} accent="from-amber-500 to-orange-500" />
        <StatCard icon={FileCheck2} label="Submitted" value={stats.submitted} loading={stats.loading} accent="from-violet-500 to-purple-600" />
        <StatCard icon={ClipboardList} label="Graded" value={stats.graded} loading={stats.loading} accent="from-emerald-500 to-green-600" />
      </div>

      {/* Tabs */}
      <div className="mb-5 inline-flex rounded-2xl border border-line bg-surface p-1.5 shadow-card">
        {(
          [
            { key: 'assignments', label: 'Assignments', icon: ListChecks },
            { key: 'submissions', label: 'My submissions', icon: FileCheck2 },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-primary to-primary-hover text-primary-fg shadow-pop'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'assignments' ? (
        <AssignmentsBrowser key={refreshKey} />
      ) : (
        <MySubmissionsBrowser key={refreshKey} />
      )}
    </div>
  );
}
