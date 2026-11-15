'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  User,
} from 'lucide-react';
import { useReplyToTicket, useTicket } from '@/hooks/support/use-support';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import { ErrorState, Skeleton } from '@/components/commerce/state-views';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/support/ticket-status-badge';
import {
  formatTicketDate,
  formatTicketDateTime,
  relativeTime,
  ticketCategoryLabel,
} from '@/components/support/support-display';
import type { TicketMessage } from '@/types/support';

function MessageBubble({ message, isStudent }: { message: TicketMessage; isStudent: boolean }) {
  const isSupport = message.senderRole === 'admin' || message.senderRole === 'instructor';
  const senderLabel = isStudent ? 'You' : isSupport ? 'Support Team' : 'Student';

  return (
    <div className={cn('flex gap-3', isStudent ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          isStudent
            ? 'bg-primary text-primary-fg'
            : isSupport
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-surface-2 text-ink-muted'
        )}
      >
        {isStudent ? <User className="size-4" aria-hidden /> : <MessageSquare className="size-4" aria-hidden />}
      </div>
      <div className={cn('max-w-[80%] sm:max-w-[70%]', isStudent ? 'text-right' : 'text-left')}>
        <div className="mb-1 flex items-center gap-2 text-[11px] text-ink-subtle">
          <span className="font-semibold text-ink-muted">{senderLabel}</span>
          <span>·</span>
          <span title={formatTicketDateTime(message.createdAt)}>{relativeTime(message.createdAt)}</span>
        </div>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isStudent
              ? 'bg-primary text-primary-fg'
              : 'bg-surface-2 text-ink border border-line'
          )}
        >
          <p className="whitespace-pre-wrap">{message.message}</p>
          {message.attachments?.length ? (
            <div className="mt-2 space-y-1">
              {message.attachments.map((a, i) => (
                <a
                  key={a.id || i}
                  href={a.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center gap-1 text-xs underline',
                    isStudent ? 'text-primary-fg/80' : 'text-primary'
                  )}
                >
                  {a.fileName || 'Attachment'}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { status: authStatus, user } = useAuth();
  const toast = useToast();
  const detail = useTicket(id, authStatus === 'authenticated');
  const reply = useReplyToTicket(id ?? '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const ticket = detail.data;
  const isClosed = ticket?.status === 'closed';

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages?.length]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !id) return;
    setError(null);
    try {
      await reply.mutateAsync({ message: message.trim() });
      setMessage('');
      toast.success('Reply sent');
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized.message);
      toast.error('Could not send reply', normalized.message);
    }
  };

  if (detail.isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (detail.isError || !ticket) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="Ticket not found"
          description="This ticket is unavailable or does not belong to your account."
          onRetry={() => detail.refetch()}
          retrying={detail.isFetching}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/support"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to support
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-primary/10 via-surface to-surface p-6 shadow-card sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-pop">
                <MessageSquare className="size-7" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  Ticket
                </p>
                <h2 className="font-mono text-xl font-bold tracking-wide text-ink">{ticket.ticketNumber}</h2>
                <p className="mt-0.5 text-sm text-ink-muted">{ticketCategoryLabel(ticket.category)}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-ink">{ticket.subject}</h3>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line/60 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Created</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-ink">
                <Calendar className="size-3.5 text-ink-subtle" aria-hidden />
                {formatTicketDate(ticket.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Last activity</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-ink">
                <Clock className="size-3.5 text-ink-subtle" aria-hidden />
                {relativeTime(ticket.lastActivityAt)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Messages</p>
              <p className="mt-1 text-sm font-medium text-ink">{ticket.messages?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Priority</p>
              <p className="mt-1 text-sm font-medium text-ink capitalize">{ticket.priority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <h4 className="text-sm font-semibold text-ink">Description</h4>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">{ticket.description}</p>
      </div>

      {/* Conversation */}
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
        <h4 className="mb-4 text-sm font-semibold text-ink">Conversation</h4>
        <div className="space-y-4">
          {(ticket.messages ?? []).map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isStudent={m.senderRole === 'student' && m.senderId === user?.id}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Reply composer */}
      {isClosed ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 text-center shadow-card">
          <Lock className="mx-auto size-8 text-ink-subtle" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-ink">This ticket is closed</p>
          <p className="mt-1 text-xs text-ink-muted">
            You cannot reply to a closed ticket. Please create a new ticket if you need further assistance.
          </p>
          <Link
            href="/support/new"
            className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
          >
            Create new ticket
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReply} className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <h4 className="mb-3 text-sm font-semibold text-ink">Reply</h4>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply…"
            rows={4}
            maxLength={5000}
            className={cn(
              'w-full rounded-lg border border-field-border bg-field px-3 py-2.5 text-sm text-ink',
              'placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
              'resize-y disabled:opacity-60'
            )}
            disabled={reply.isPending}
          />
          <div className="mt-2 flex items-center justify-between">
            {error ? (
              <p className="text-xs text-danger">{error}</p>
            ) : (
              <p className="text-xs text-ink-subtle">{message.length}/5,000</p>
            )}
            <button
              type="submit"
              disabled={!message.trim() || reply.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover disabled:opacity-60'
              )}
            >
              {reply.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
              {reply.isPending ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
