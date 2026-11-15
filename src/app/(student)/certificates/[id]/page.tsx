'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  GraduationCap,
  Hash,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useCertificate, useDownloadCertificate } from '@/hooks/certificates/use-certificates';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { CertificateStatusBadge } from '@/components/certificates/certificate-card';
import { certificateFileName, formatCertificateDate } from '@/components/certificates/certificate-display';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export default function CertificateDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const detail = useCertificate(id);
  const download = useDownloadCertificate();
  const [error, setError] = useState<string | null>(null);

  if (detail.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Certificate not found"
          description="This certificate is unavailable or does not belong to your account."
          onRetry={() => detail.refetch()}
          retrying={detail.isFetching}
        />
      </div>
    );
  }

  const c = detail.data;
  const revoked = c.certificateStatus === 'revoked';

  const handleDownload = async () => {
    setError(null);
    try {
      await download.mutateAsync({ id: c.id, fallbackName: certificateFileName(c) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/certificates"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to certificates
      </Link>

      {/* Certificate preview */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-amber-50/50 via-surface to-surface p-6 shadow-card sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-amber-200/30 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-pop">
                <Award className="size-7" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  Certificate of Completion
                </p>
                <h2 className="mt-0.5 font-mono text-xl font-bold tracking-wide text-ink">
                  {c.certificateNumber}
                </h2>
              </div>
            </div>
            <CertificateStatusBadge status={c.certificateStatus} />
          </div>

          <div className="mt-8 border-t border-dashed border-line/70 pt-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
              Awarded to
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{c.studentName}</p>
            <p className="mt-2 text-sm text-ink-muted">for successfully completing</p>
            <p className="mt-1 text-xl font-semibold text-ink">{c.courseName}</p>
            {c.organizationName ? (
              <p className="mt-3 text-xs text-ink-subtle">{c.organizationName}</p>
            ) : null}
          </div>

          {revoked && c.revocationReason ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-700">Certificate revoked</p>
              <p className="mt-1 text-sm text-rose-600">{c.revocationReason}</p>
              {c.revokedAt ? (
                <p className="mt-1 text-xs text-rose-500">Revoked on {formatCertificateDate(c.revokedAt)}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <h3 className="text-sm font-semibold text-ink">Certificate details</h3>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Hash className="mt-0.5 size-4 text-ink-subtle" aria-hidden />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Certificate number
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-semibold text-ink">{c.certificateNumber}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="mt-0.5 size-4 text-ink-subtle" aria-hidden />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Student
              </dt>
              <dd className="mt-0.5 text-sm text-ink">{c.studentName}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <GraduationCap className="mt-0.5 size-4 text-ink-subtle" aria-hidden />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Course
              </dt>
              <dd className="mt-0.5 text-sm text-ink">{c.courseName}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 size-4 text-ink-subtle" aria-hidden />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Issue date
              </dt>
              <dd className="mt-0.5 text-sm text-ink">{formatCertificateDate(c.issueDate)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 text-ink-subtle" aria-hidden />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Completion date
              </dt>
              <dd className="mt-0.5 text-sm text-ink">{formatCertificateDate(c.completionDate)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 text-ink-subtle" aria-hidden />
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                Status
              </dt>
              <dd className="mt-0.5 text-sm text-ink">{c.certificateStatus}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        {error ? (
          <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={download.isPending || revoked}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
              revoked
                ? 'cursor-not-allowed bg-surface-2 text-ink-subtle'
                : 'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover hover:shadow-pop disabled:opacity-60'
            )}
          >
            <Download className="size-4" aria-hidden />
            {download.isPending ? 'Downloading…' : 'Download certificate PDF'}
          </button>
          <a
            href={c.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
          >
            <ExternalLink className="size-4" aria-hidden />
            Verify certificate
          </a>
        </div>
        <p className="mt-3 text-xs text-ink-subtle">
          The PDF is generated by the server and includes a verification QR code.
        </p>
      </div>
    </div>
  );
}
