'use client';

import { Bell } from 'lucide-react';
import { NotificationsBrowser } from '@/components/notifications/notifications-browser';

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-fg shadow-pop">
            <Bell className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Notifications</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              Updates, announcements and account activity.
            </p>
          </div>
        </div>
      </div>

      <NotificationsBrowser />
    </div>
  );
}
