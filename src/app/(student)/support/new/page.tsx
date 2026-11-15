'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useCreateTicket } from '@/hooks/support/use-support';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import type { TicketCategory, TicketPriority } from '@/types/support';

const CATEGORIES: { value: TicketCategory; label: string; description: string }[] = [
  { value: 'account_login', label: 'Account & Login', description: 'Login issues, password reset, profile problems' },
  { value: 'course_learning', label: 'Course & Learning', description: 'Course access, lessons, progress, content issues' },
  { value: 'payment_fees', label: 'Payment & Fees', description: 'Billing, refunds, payment failures, invoices' },
  { value: 'certificate', label: 'Certificate', description: 'Certificate generation, download, verification' },
  { value: 'technical_issue', label: 'Technical Issue', description: 'Bugs, errors, video playback, browser issues' },
  { value: 'other', label: 'Other', description: 'Anything else not covered above' },
];

const PRIORITIES: { value: TicketPriority; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'General inquiry, no urgency' },
  { value: 'normal', label: 'Normal', description: 'Standard support request' },
  { value: 'high', label: 'High', description: 'Affects your learning progress' },
  { value: 'urgent', label: 'Urgent', description: 'Critical issue blocking access' },
];

const inputClass = cn(
  'h-11 w-full rounded-lg border border-field-border bg-field px-3 text-sm text-ink',
  'placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
  'disabled:cursor-not-allowed disabled:opacity-60'
);

const textareaClass = cn(
  'w-full rounded-lg border border-field-border bg-field px-3 py-2.5 text-sm text-ink',
  'placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
  'disabled:cursor-not-allowed disabled:opacity-60 resize-y'
);

export default function NewTicketPage() {
  const { status } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const createTicket = useCreateTicket();

  const [category, setCategory] = useState<TicketCategory>('technical_issue');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!subject.trim()) errs.subject = 'Subject is required';
    else if (subject.trim().length < 3) errs.subject = 'Subject must be at least 3 characters';
    else if (subject.trim().length > 200) errs.subject = 'Subject must be at most 200 characters';
    if (!description.trim()) errs.description = 'Description is required';
    else if (description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
    else if (description.trim().length > 10000) errs.description = 'Description must be at most 10,000 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const ticket = await createTicket.mutateAsync({
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });
      toast.success('Ticket created', `Ticket ${ticket.ticketNumber} has been submitted.`);
      router.push(`/support/${ticket.id}`);
    } catch (err) {
      toast.error('Could not create ticket', normalizeApiError(err).message);
    }
  };

  if (status !== 'authenticated') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="text-sm text-ink-muted">Please sign in to create a support ticket.</p>
          <Link href="/login?next=/support/new" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/support"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to support
      </Link>

      <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-xl font-bold tracking-tight text-ink">Create Support Ticket</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Describe your issue and our support team will assist you.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Category</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    category === c.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-line bg-surface hover:border-primary/30'
                  )}
                >
                  <p className="text-sm font-semibold text-ink">{c.label}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{c.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Priority</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    priority === p.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-line bg-surface hover:border-primary/30'
                  )}
                >
                  <p className="text-sm font-semibold text-ink">{p.label}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-ink">
              Subject <span className="text-danger">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              maxLength={200}
              className={inputClass}
              disabled={createTicket.isPending}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.subject ? (
                <p className="text-xs text-danger">{errors.subject}</p>
              ) : (
                <p className="text-xs text-ink-subtle">Min 3, max 200 characters</p>
              )}
              <p className="text-xs text-ink-subtle">{subject.length}/200</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-ink">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about your issue. Include steps to reproduce, error messages, or any relevant information."
              rows={8}
              maxLength={10000}
              className={textareaClass}
              disabled={createTicket.isPending}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.description ? (
                <p className="text-xs text-danger">{errors.description}</p>
              ) : (
                <p className="text-xs text-ink-subtle">Min 10, max 10,000 characters</p>
              )}
              <p className="text-xs text-ink-subtle">{description.length}/10,000</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between border-t border-line pt-6">
            <Link
              href="/support"
              className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createTicket.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover hover:shadow-pop disabled:opacity-60'
              )}
            >
              {createTicket.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
              {createTicket.isPending ? 'Creating…' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
