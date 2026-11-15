'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import { useLatestNotifications } from '@/hooks/notifications/use-notifications';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/cn';
import type { AppNotification } from '@/types/notifications';
import {
  absoluteTime,
  notificationDestination,
  notificationIcon,
  notificationTone,
  relativeTime,
} from './notification-display';

interface NotificationToast {
  id: string;
  notification: AppNotification;
}

interface NotificationToastContextValue {
  toasts: NotificationToast[];
  dismiss: (id: string) => void;
}

const NotificationToastContext = createContext<NotificationToastContextValue | null>(null);

const SEEN_KEY_PREFIX = 'skillbee-notif-seen:';
const MAX_TOASTS = 3;
const TOAST_DURATION_MS = 8000;

function loadSeenIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY_PREFIX + userId);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr.slice(-200)); // cap at 200
  } catch {
    return new Set();
  }
}

function saveSeenIds(userId: string, ids: Set<string>) {
  try {
    const arr = Array.from(ids).slice(-200);
    localStorage.setItem(SEEN_KEY_PREFIX + userId, JSON.stringify(arr));
  } catch {
    // storage unavailable
  }
}

function NotificationToastCard({
  toast,
  onDismiss,
}: {
  toast: NotificationToast;
  onDismiss: () => void;
}) {
  const router = useRouter();
  const n = toast.notification;
  const Icon = notificationIcon(n.type);
  const tone = notificationTone(n.type);
  const dest = notificationDestination(n);

  const handleClick = () => {
    onDismiss();
    if (dest) router.push(dest);
  };

  return (
    <div
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-lg animate-[toast-in_200ms_ease-out]"
      role="alert"
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl', tone)}>
          {createElement(Icon, { className: 'size-4', 'aria-hidden': true })}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{n.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">{n.message}</p>
          <p className="mt-1 text-[11px] text-ink-subtle" title={absoluteTime(n.createdAt)}>
            {relativeTime(n.createdAt)}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 text-ink-subtle transition-colors hover:text-ink"
        aria-label="Dismiss notification"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

/**
 * Polls for new notifications every 60s and shows toasts for unread ones
 * that haven't been seen before. Persists seen IDs in localStorage to
 * avoid re-toasting old notifications after page refresh.
 */
export function NotificationToastProvider({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const seenRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const latestQuery = useLatestNotifications(status === 'authenticated');
  const notifications = useMemo(() => latestQuery.data?.data ?? [], [latestQuery.data]);

  const userId = user?.id ?? '';

  // Load seen IDs on mount / user change
  useEffect(() => {
    if (!userId) return;
    seenRef.current = loadSeenIds(userId);
    initializedRef.current = false;
  }, [userId]);

  // Detect new notifications and show toasts
  useEffect(() => {
    if (!userId || notifications.length === 0) return;

    const currentIds = new Set(notifications.map((n) => n.id));

    // First load: mark all current as seen, don't toast
    if (!initializedRef.current) {
      for (const id of currentIds) seenRef.current.add(id);
      saveSeenIds(userId, seenRef.current);
      initializedRef.current = true;
      return;
    }

    // Find new unread notifications not yet seen
    const newOnes = notifications.filter(
      (n) => !n.isRead && !seenRef.current.has(n.id)
    );

    if (newOnes.length === 0) return;

    // Add to seen and show toasts (newest first, max MAX_TOASTS)
    const toAdd = newOnes.slice(0, MAX_TOASTS);
    for (const n of newOnes) seenRef.current.add(n.id);
    saveSeenIds(userId, seenRef.current);

    setToasts((prev) => {
      const existing = new Set(prev.map((t) => t.id));
      const fresh = toAdd
        .filter((n) => !existing.has(n.id))
        .map((n) => ({ id: n.id, notification: n }));
      return [...prev, ...fresh].slice(-MAX_TOASTS);
    });

    // Set auto-dismiss timers
    for (const n of toAdd) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== n.id));
        toastTimersRef.current.delete(n.id);
      }, TOAST_DURATION_MS);
      toastTimersRef.current.set(n.id, timer);
    }
  }, [notifications, userId]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
  }, []);

  const value = useMemo(() => ({ toasts, dismiss }), [toasts, dismiss]);

  return (
    <NotificationToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        className="pointer-events-none fixed right-4 top-20 z-[80] flex w-full max-w-sm flex-col gap-2 sm:right-6"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <NotificationToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </NotificationToastContext.Provider>
  );
}

export function useNotificationToasts(): NotificationToastContextValue {
  const ctx = useContext(NotificationToastContext);
  if (!ctx) throw new Error('useNotificationToasts must be used inside <NotificationToastProvider>');
  return ctx;
}
