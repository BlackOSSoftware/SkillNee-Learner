'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notifications/notifications.service';
import type {
  AppNotification,
  NotificationsListResponse,
  NotificationsQuery,
} from '@/types/notifications';

/** Notification queries and mutations. */

export function useNotifications(query: NotificationsQuery = {}, enabled = true) {
  return useQuery<NotificationsListResponse>({
    queryKey: queryKeys.notifications.list(query as Record<string, unknown>),
    queryFn: () => listNotifications(query),
    enabled,
    staleTime: 15_000,
  });
}

/** Unread count — fetches with limit=1 and reads pagination.total. */
export function useUnreadCount(enabled = true) {
  return useQuery<number>({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const res = await listNotifications({ isRead: false, limit: 1 });
      return res.pagination.total;
    },
    enabled,
    staleTime: 15_000,
    refetchInterval: 60_000, // poll every 60s for unread count
  });
}

/** Latest 3 notifications for the dropdown. */
export function useLatestNotifications(enabled = true) {
  return useQuery<NotificationsListResponse>({
    queryKey: queryKeys.notifications.latest,
    queryFn: () => listNotifications({ limit: 3 }),
    enabled,
    staleTime: 15_000,
    refetchInterval: 60_000, // poll every 60s for new notifications
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<AppNotification, unknown, string>({
    mutationFn: markNotificationRead,
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation<{ modified: number }, unknown, void>({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation<AppNotification, unknown, string>({
    mutationFn: deleteNotification,
    onSuccess: () => invalidateAll(queryClient),
  });
}
