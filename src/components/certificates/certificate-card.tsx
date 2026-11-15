'use client';

import Link from 'next/link';
import { Award, Calendar, Download, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import type { StudentCertificate } from '@/types/certificates';
import { certificateFileName, certificateStatusLabel, formatCertificateDate } from './certificate-display';
import { useDownloadCertificate } from '@/hooks/certificates/use-certificates';
import { cn } from '@/lib/cn';
import { useState } from 'react';

const STATUS_STYLES: Record<StudentCertificate['certificateStatus'], string> = {
  issued: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  revoked: 'bg-rose-50 text-rose-700 border-rose-200',
  expired: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function CertificateStatusBadge({ status }: { status: StudentCertificate['certificateStatus'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        STATUS_STYLES[status]
      )}
    >
      <ShieldCheck className="size-3" aria-hidden />
      {certificateStatusLabel(status)}
    </span>
  );
}

export function CertificateCard({ certificate }: { certificate: StudentCertificate }) {
  const download = useDownloadCertificate();
  const [error, setError] = useState<string | null>(null);
  const revoked = certificate.certificateStatus === 'revoked';

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    try {
      await download.mutateAsync({
        id: certificate.id,
        fallbackName: certificateFileName(certificate),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.');
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-pop',
        revoked ? 'border-rose-200/70 opacity-90' : 'border-line'
      )}
    >
      {/* Certificate preview header */}
      <div className="relative border-b border-line/60 bg-gradient-to-br from-amber-50/60 via-surface to-surface px-5 pb-5 pt-6">
        <div
          className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-amber-200/30 blur-2xl"
          aria-hidden
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm">
              <Award className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Certificate of Completion
              </p>
              <p className="font-mono text-sm font-bold tracking-wide text-ink">
                {certificate.certificateNumber}
              </p>
            </div>
          </div>
          <CertificateStatusBadge status={certificate.certificateStatus} />
        </div>

        <div className="relative mt-4 border-t border-dashed border-line/70 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
            Awarded to
          </p>
          <p className="mt-0.5 text-lg font-semibold leading-tight text-ink">
            {certificate.studentName}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{certificate.courseName}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col px-5 py-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
              Issued
            </dt>
            <dd className="mt-0.5 inline-flex items-center gap-1 text-ink">
              <Calendar className="size-3 text-ink-subtle" aria-hidden />
              {formatCertificateDate(certificate.issueDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
              Completed
            </dt>
            <dd className="mt-0.5 text-ink">{formatCertificateDate(certificate.completionDate)}</dd>
          </div>
        </dl>

        {certificate.organizationName ? (
          <p className="mt-3 text-[11px] text-ink-subtle">Issued by {certificate.organizationName}</p>
        ) : null}

        {revoked && certificate.revocationReason ? (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {certificate.revocationReason}
          </p>
        ) : null}

        {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}

        <div className="mt-4 flex items-center gap-2 border-t border-line/60 pt-4">
          <Link
            href={`/certificates/${certificate.id}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
          >
            <FileText className="size-4" aria-hidden />
            Details
          </Link>
          <button
            type="button"
            onClick={handleDownload}
            disabled={download.isPending || revoked}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all',
              revoked
                ? 'cursor-not-allowed bg-surface-2 text-ink-subtle'
                : 'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover hover:shadow-pop disabled:opacity-60'
            )}
          >
            <Download className="size-4" aria-hidden />
            {download.isPending ? 'Downloading…' : 'PDF'}
          </button>
        </div>

        <a
          href={certificate.verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center gap-1 text-[11px] font-medium text-ink-subtle transition-colors hover:text-primary"
        >
          <ExternalLink className="size-3" aria-hidden />
          Verify certificate
        </a>
      </div>
    </div>
  );
}
