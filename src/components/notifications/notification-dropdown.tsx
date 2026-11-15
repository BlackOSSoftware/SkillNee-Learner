'use client';

import Link from 'next/link';
import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  useLatestNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadCount,
} from '@/hooks/notifications/use-notifications';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { normalizeApiError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import type { AppNotification } from '@/types/notifications';
import {
  absoluteTime,
  notificationDestination,
  notificationIcon,
  notificationTone,
  relativeTime,
} from './notification-display';

function NotificationItem({
  notification,
  onClick,
  onMarkRead,
}: {
  notification: AppNotification;
  onClick: () => void;
  onMarkRead: () => void;
}) {
  const Icon = notificationIcon(notification.type);
  const tone = notificationTone(notification.type);
  const dest = notificationDestination(notification);

  const handleClick = () => {
    if (!notification.isRead) onMarkRead();
    onClick();
  };

  const content = (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/60',
        !notification.isRead && 'bg-primary/[0.03]'
      )}
    >
      <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl', tone)}>
        {createElement(Icon, { className: 'size-4', 'aria-hidden': true })}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('truncate text-sm', notification.isRead ? 'font-medium text-ink' : 'font-semibold text-ink')}>
            {notification.title}
          </p>
          {!notification.isRead ? (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
          {notification.message}
        </p>
        <p className="mt-1 text-[11px] text-ink-subtle" title={absoluteTime(notification.createdAt)}>
          {relativeTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );

  if (dest) {
    return (
      <Link href={dest} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

export function NotificationDropdown() {
  const { status } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadQuery = useUnreadCount(status === 'authenticated');
  const latestQuery = useLatestNotifications(status === 'authenticated' && open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = unreadQuery.data ?? 0;
  const notifications = latestQuery.data?.data ?? [];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleMarkRead = useCallback(
    (id: string) => {
      markRead.mutate(id, {
        onError: (err) => toast.error('Could not mark as read', normalizeApiError(err).message),
      });
    },
    [markRead, toast]
  );

  const handleMarkAll = useCallback(() => {
    markAll.mutate(undefined, {
      onSuccess: () => toast.success('All notifications marked as read'),
      onError: (err) => toast.error('Could not mark all as read', normalizeApiError(err).message),
    });
  }, [markAll, toast]);

  const handleNotificationClick = useCallback(() => {
    setOpen(false);
  }, []);

  if (status !== 'authenticated') return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'relative rounded-lg p-2 transition-colors',
          open ? 'bg-surface-2 text-ink' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
        )}
      >
        <Bell className="size-4.5" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-fg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
          role="menu"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line/60 px-4 py-3">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={markAll.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
              >
                {markAll.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <CheckCheck className="size-3.5" aria-hidden />
                )}
                Mark all read
              </button>
            ) : null}
          </div>

          {/* List */}
          <div className="max-h-[min(420px,60vh)] overflow-y-auto">
            {latestQuery.isPending ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="size-9 animate-pulse rounded-xl bg-surface-2" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-surface-2" />
                      <div className="h-2.5 w-full animate-pulse rounded bg-surface-2" />
                      <div className="h-2 w-1/3 animate-pulse rounded bg-surface-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : latestQuery.isError ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-ink-muted">Could not load notifications.</p>
                <button
                  type="button"
                  onClick={() => latestQuery.refetch()}
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-ink-subtle">
                  <Bell className="size-5" aria-hidden />
                </span>
                <p className="mt-3 text-sm font-medium text-ink">No notifications yet</p>
                <p className="mt-1 text-xs text-ink-muted">You&apos;ll see updates here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line/50">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <NotificationItem
                      notification={n}
                      onClick={handleNotificationClick}
                      onMarkRead={() => handleMarkRead(n.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-line/60 px-4 py-3">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
            >
              View all notifications
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
