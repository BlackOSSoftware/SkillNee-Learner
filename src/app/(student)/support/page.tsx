'use client';

import { LifeBuoy } from 'lucide-react';
import { SupportBrowser } from '@/components/support/support-browser';

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-pop">
            <LifeBuoy className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Support Center</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Get help with your courses, payments, certificates and account.
            </p>
          </div>
        </div>
      </div>

      <SupportBrowser />
    </div>
  );
}
