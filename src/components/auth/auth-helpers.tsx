'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleAlert } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';

/** Standard heading block for auth pages. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-muted">{subtitle}</p>
    </div>
  );
}

/** Inline API error banner. */
export function FormAlert({ error, className }: { error: unknown; className?: string }) {
  if (!error) return null;
  const { message } = normalizeApiError(error);
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger',
        className
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

/** Footer row with links between auth pages. */
export function AuthLinks({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-center text-sm text-ink-muted">{children}</p>;
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-primary hover:text-primary-hover hover:underline">
      {children}
    </Link>
  );
}

/** Redirects authenticated users away from auth pages to the dashboard. */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  if (status !== 'unauthenticated') {
    return (
      <div className="flex flex-1 items-center justify-center py-24" role="status" aria-label="Loading">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
