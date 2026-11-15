'use client';

import { useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  CheckCircle2,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import type { Assignment, AssignmentSubmission } from '@/types/assignments';
import type { ApiErrorBody } from '@/types/api';
import { useSubmitAssignment } from '@/hooks/assignments/use-assignments';
import {
  canSubmitNow,
  formatBytes,
  validateSubmissionFile,
} from './assignment-display';
import { cn } from '@/lib/cn';

const MAX_FILES = 5;

interface SubmissionFormProps {
  assignment: Assignment;
  mySubmission: AssignmentSubmission | null;
  onSubmitted: (submission: AssignmentSubmission) => void;
}

export function SubmissionForm({ assignment, mySubmission, onSubmitted }: SubmissionFormProps) {
  const submit = useSubmitAssignment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  const needsText = assignment.submissionType === 'text' || assignment.submissionType === 'file_and_text';
  const needsFiles = assignment.submissionType === 'file_upload' || assignment.submissionType === 'file_and_text';
  const gate = canSubmitNow(assignment, mySubmission);
  const isResubmission = Boolean(mySubmission);

  const addFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const errors: string[] = [];
    const accepted: File[] = [];
    for (const f of list) {
      if (files.length + accepted.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      const err = validateSubmissionFile(f, assignment);
      if (err) errors.push(err);
      else accepted.push(f);
    }
    setFiles((prev) => [...prev, ...accepted]);
    setFileErrors(errors);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileErrors([]);
  };

  const validate = (): string | null => {
    if (needsText && !text.trim()) return 'Please write your submission text.';
    if (needsFiles && files.length === 0) return 'Please attach at least one file.';
    if (text.length > 50000) return 'Text is too long (max 50,000 characters).';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setProgress(0);
    try {
      const submission = await submit.mutateAsync({
        id: assignment.id,
        input: {
          textContent: needsText ? text.trim() : undefined,
          files: needsFiles ? files : undefined,
        },
        onUploadProgress: setProgress,
      });
      setDone(true);
      setSubmittedStatus(submission.submissionStatus);
      setText('');
      setFiles([]);
      setProgress(null);
      onSubmitted(submission);
    } catch (e) {
      setProgress(null);
      const apiErr = isAxiosError<ApiErrorBody>(e) ? e.response?.data?.error : undefined;
      setError(apiErr?.message ?? 'Submission failed. Please try again.');
    }
  };

  if (!gate.allowed) {
    return (
      <div className="rounded-xl border border-line bg-surface-2/60 p-4 text-sm text-ink-muted">
        {gate.reason ?? 'Submission is not available for this assignment.'}
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/25 bg-success/10 p-4 text-sm text-success">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden />
        <span>
          {isResubmission ? 'Resubmission' : 'Submission'} received. Status:{' '}
          <strong>{submissionStatusLabelSafe(submittedStatus)}</strong>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">
          {isResubmission ? 'Resubmit assignment' : 'Submit assignment'}
        </h3>
        {isResubmission && mySubmission ? (
          <span className="text-xs text-ink-subtle">
            Attempt {mySubmission.version} of {assignment.maxSubmissions}
          </span>
        ) : null}
      </div>

      {needsText ? (
        <div>
          <label htmlFor="submission-text" className="mb-1.5 block text-xs font-medium text-ink-muted">
            Your answer {needsFiles ? '(required)' : ''}
          </label>
          <textarea
            id="submission-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            maxLength={50000}
            placeholder="Write your submission here…"
            className="w-full rounded-xl border border-field-border bg-field px-3.5 py-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-right text-[11px] text-ink-subtle">{text.length.toLocaleString()} / 50,000</p>
        </div>
      ) : null}

      {needsFiles ? (
        <div>
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">
            Attachments {needsText ? '(required)' : ''}
          </span>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
              dragOver ? 'border-primary bg-primary/5' : 'border-line bg-surface-2/50 hover:border-primary/50'
            )}
          >
            <UploadCloud className="mb-2 size-7 text-ink-subtle" aria-hidden />
            <p className="text-sm font-medium text-ink">Drag & drop files here, or browse</p>
            <p className="mt-1 text-xs text-ink-subtle">
              Up to {MAX_FILES} files · {assignment.allowedFileTypes.join(', ')} · max{' '}
              {formatBytes(assignment.maximumFileSizeBytes)} each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {files.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2"
                >
                  <Paperclip className="size-4 shrink-0 text-ink-subtle" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink" title={f.name}>
                    {f.name}
                  </span>
                  <span className="shrink-0 text-xs text-ink-subtle">{formatBytes(f.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${f.name}`}
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {fileErrors.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {fileErrors.map((err) => (
                <li key={err} className="flex items-start gap-1.5 text-xs text-danger">
                  <X className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {err}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {progress != null ? (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-ink-subtle">Uploading… {progress}%</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={submit.isPending || progress != null}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submit.isPending || progress != null ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <FileText className="size-4" aria-hidden />
        )}
        {isResubmission ? 'Resubmit' : 'Submit assignment'}
      </button>
    </div>
  );
}

function submissionStatusLabelSafe(status?: string | null): string {
  switch (status) {
    case 'submitted':
      return 'Submitted';
    case 'under_review':
      return 'Under review';
    case 'evaluated':
      return 'Graded';
    case 'returned':
      return 'Returned';
    case 'resubmitted':
      return 'Resubmitted';
    default:
      return status ?? 'Received';
  }
}
