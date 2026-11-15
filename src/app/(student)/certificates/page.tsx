'use client';

import { Award } from 'lucide-react';
import { CertificatesBrowser } from '@/components/certificates/certificates-browser';

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-pop">
            <Award className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Certificates</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Your earned certificates — view details and download PDFs.
            </p>
          </div>
        </div>
      </div>

      <CertificatesBrowser />
    </div>
  );
}
