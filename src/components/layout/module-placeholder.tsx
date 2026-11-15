import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Construction } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Consistent placeholder for modules whose backend APIs are discovered
 * but not yet integrated. Never presents itself as finished functionality.
 */
export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
  apis,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  apis?: string[];
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-7" aria-hidden />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">{description}</p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-muted">
        <Construction className="size-3.5 text-warning" aria-hidden />
        Integration in progress — real data coming soon
      </div>

      {apis && apis.length > 0 && (
        <div className="mt-8 w-full rounded-2xl border border-line bg-surface p-5 text-left shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
            Backing APIs ready
          </p>
          <ul className="mt-3 space-y-1.5">
            {apis.map((api) => (
              <li key={api} className="font-mono text-xs text-ink-muted">
                {api}
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}

      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover hover:underline"
      >
        Back to dashboard <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
