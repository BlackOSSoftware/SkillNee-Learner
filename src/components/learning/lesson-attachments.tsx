'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useLessonAttachments } from '@/hooks/learning/use-learning';
import { downloadLessonAttachment } from '@/services/learning/learning.service';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import type { LessonAttachment } from '@/types/learning';

function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

export function LessonAttachments({ lessonId }: { lessonId: string }) {
  const toast = useToast();
  const attachmentsQuery = useLessonAttachments(lessonId);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const attachments = attachmentsQuery.data ?? [];

  const handleDownload = async (att: LessonAttachment) => {
    setDownloadingId(att.id);
    try {
      const { blob, filename } = await downloadLessonAttachment(lessonId, att.id);
      triggerDownload(blob, filename);
      toast.success('Download started', filename);
    } catch (e) {
      toast.error('Download failed', normalizeApiError(e).message);
    } finally {
      setDownloadingId(null);
    }
  };

  if (attachmentsQuery.isPending) {
    return (
      <div className="space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
        <div className="h-14 w-full animate-pulse rounded-xl bg-surface-2" />
      </div>
    );
  }

  if (attachmentsQuery.isError) {
    return (
      <p className="text-sm text-ink-muted">Could not load attachments.</p>
    );
  }

  if (attachments.length === 0) return null;

  return (
    <section className="mt-6">
      <h4 className="mb-3 text-sm font-semibold text-ink">Resources &amp; attachments</h4>
      <ul className="space-y-2">
        {attachments.map((att) => (
          <li
            key={att.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 px-4 py-3 transition-colors hover:border-primary/30"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {att.title || att.originalFileName || 'Attachment'}
              </p>
              <p className="text-xs text-ink-subtle">
                {[att.resourceType, att.mimeType, formatSize(att.sizeBytes)].filter(Boolean).join(' · ')}
              </p>
              {att.description ? (
                <p className="mt-0.5 truncate text-xs text-ink-muted">{att.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => void handleDownload(att)}
              disabled={downloadingId === att.id}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60'
              )}
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
    </section>
  );
}
