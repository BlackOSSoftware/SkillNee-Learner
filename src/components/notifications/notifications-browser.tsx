'use client';

import Link from 'next/link';
import { createElement, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SearchX,
  Trash2,
} from 'lucide-react';
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/notifications/use-notifications';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import type { AppNotification } from '@/types/notifications';
import { EmptyState, ErrorState, Skeleton } from '@/components/commerce/state-views';
import {
  absoluteTime,
  notificationDestination,
  notificationIcon,
  notificationTone,
  notificationTypeLabel,
  relativeTime,
} from './notification-display';

type FilterTab = 'all' | 'unread' | 'read';

const PAGE_SIZE = 20;

function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
  markingRead,
  deleting,
}: {
  notification: AppNotification;
  onMarkRead: () => void;
  onDelete: () => void;
  markingRead: boolean;
  deleting: boolean;
}) {
  const Icon = notificationIcon(notification.type);
  const tone = notificationTone(notification.type);
  const dest = notificationDestination(notification);

  const handleClick = () => {
    if (!notification.isRead) onMarkRead();
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-4 rounded-2xl border p-4 transition-all',
        notification.isRead
          ? 'border-line bg-surface'
          : 'border-primary/20 bg-primary/[0.02] shadow-sm'
      )}
    >
      <span className={cn('mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl', tone)}>
        {createElement(Icon, { className: 'size-5', 'aria-hidden': true })}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn('text-sm', notification.isRead ? 'font-medium text-ink' : 'font-semibold text-ink')}>
                {notification.title}
              </p>
              {!notification.isRead ? (
                <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
              ) : null}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{notification.message}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-subtle">
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-medium uppercase tracking-wide">
                {notificationTypeLabel(notification.type)}
              </span>
              <span title={absoluteTime(notification.createdAt)}>{relativeTime(notification.createdAt)}</span>
              {notification.readAt ? (
                <span className="text-ink-subtle/70">Read {relativeTime(notification.readAt)}</span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!notification.isRead ? (
              <button
                type="button"
                onClick={onMarkRead}
                disabled={markingRead}
                className="rounded-lg p-1.5 text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50"
                aria-label="Mark as read"
                title="Mark as read"
              >
                {markingRead ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-lg p-1.5 text-ink-subtle transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
              aria-label="Delete notification"
              title="Delete"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            </button>
          </div>
        </div>

        {dest ? (
          <Link
            href={dest}
            onClick={handleClick}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
          >
            View details
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function NotificationsBrowser() {
  const { status } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const isReadFilter = tab === 'all' ? undefined : tab === 'unread' ? false : true;

  const query = useNotifications(
    { page, limit: PAGE_SIZE, isRead: isReadFilter },
    status === 'authenticated'
  );

  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = useMemo(() => query.data?.data ?? [], [query.data]);
  const pagination = query.data?.pagination;

  // Client-side search within the current page
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
    );
  }, [notifications, debouncedSearch]);

  const handleMarkRead = (id: string) => {
    markRead.mutate(id, {
      onError: (err) => toast.error('Could not mark as read', normalizeApiError(err).message),
    });
  };

  const handleMarkAll = () => {
    markAll.mutate(undefined, {
      onSuccess: (data) => toast.success(`${data.modified} notification${data.modified === 1 ? '' : 's'} marked as read`),
      onError: (err) => toast.error('Could not mark all as read', normalizeApiError(err).message),
    });
  };

  const handleDelete = (id: string) => {
    deleteNotif.mutate(id, {
      onSuccess: () => toast.success('Notification deleted'),
      onError: (err) => toast.error('Could not delete', normalizeApiError(err).message),
    });
  };

  const handleTabChange = (t: FilterTab) => {
    setTab(t);
    setPage(1);
  };

  const tabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
  ];

  return (
    <div className="space-y-5">
      {/* Tabs + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-line bg-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTabChange(t.value)}
              className={cn(
                'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                tab === t.value
                  ? 'bg-primary text-primary-fg shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications…"
              className="h-9 w-full rounded-lg border border-field-border bg-field pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Search notifications"
            />
          </div>
          {tab !== 'read' ? (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markAll.isPending || notifications.length === 0}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              {markAll.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CheckCheck className="size-4" aria-hidden />
              )}
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Results */}
      {query.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Could not load notifications"
          description="Please try again in a moment."
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden />}
          title={debouncedSearch ? 'No notifications match your search' : tab === 'unread' ? 'No unread notifications' : tab === 'read' ? 'No read notifications' : 'No notifications yet'}
          description={
            debouncedSearch
              ? 'Try a different search term.'
              : tab === 'unread'
                ? 'You\'re all caught up!'
                : tab === 'read'
                  ? 'Notifications you\'ve read will appear here.'
                  : 'You\'ll see updates, announcements and account activity here.'
          }
          action={
            debouncedSearch ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
              >
                Clear search
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-xs text-ink-subtle">
            {filtered.length} notification{filtered.length === 1 ? '' : 's'}
            {pagination ? ` · Page ${pagination.page} of ${pagination.totalPages}` : ''}
          </p>
          <div className="space-y-3">
            {filtered.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onMarkRead={() => handleMarkRead(n.id)}
                onDelete={() => handleDelete(n.id)}
                markingRead={markRead.isPending}
                deleting={deleteNotif.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPreviousPage}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </button>
              <span className="text-sm text-ink-muted">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
