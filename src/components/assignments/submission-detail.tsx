'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import type { AssignmentSubmission } from '@/types/assignments';
import { downloadSubmissionAttachment } from '@/services/assignments/assignments.service';
import { formatBytes, formatDateTime } from './assignment-display';
import { SubmissionStatusBadge } from './status-badges';
import { cn } from '@/lib/cn';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function SubmissionDetail({ submission }: { submission: AssignmentSubmission }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const download = async (attachmentId: string) => {
    setDownloadingId(attachmentId);
    setDownloadError(null);
    try {
      const { blob, filename } = await downloadSubmissionAttachment(submission.id, attachmentId);
      triggerDownload(blob, filename);
    } catch {
      setDownloadError('Download failed. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Your submission</h3>
        <SubmissionStatusBadge status={submission.submissionStatus} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-line bg-surface p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Submitted</dt>
          <dd className="mt-0.5 text-ink">{formatDateTime(submission.submittedAt)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Attempt</dt>
          <dd className="mt-0.5 text-ink">Version {submission.version}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Timeliness</dt>
          <dd className={cn('mt-0.5 font-medium', submission.isLate ? 'text-warning' : 'text-ink')}>
            {submission.isLate ? 'Late submission' : 'On time'}
          </dd>
        </div>
      </dl>

      {submission.textContent ? (
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-subtle">Your answer</p>
          <p className="whitespace-pre-wrap text-sm leading-6 text-ink">{submission.textContent}</p>
        </div>
      ) : null}

      {submission.attachments.length > 0 ? (
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-subtle">
            Submitted files ({submission.attachments.length})
          </p>
          <ul className="space-y-2">
            {submission.attachments.map((att) => (
              <li
                key={att.id}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/50 px-3 py-2"
              >
                <FileText className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm text-ink" title={att.originalFileName}>
                  {att.originalFileName}
                </span>
                <span className="shrink-0 text-xs text-ink-subtle">{formatBytes(att.sizeBytes)}</span>
                <button
                  type="button"
                  onClick={() => void download(att.id)}
                  disabled={downloadingId === att.id}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
                >
                  {downloadingId === att.id ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Download className="size-3.5" aria-hidden />
                  )}
                  Download
                </button>
              </li>
            ))}
          </ul>
          {downloadError ? (
            <p className="mt-2 text-xs text-danger" role="alert">
              {downloadError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
