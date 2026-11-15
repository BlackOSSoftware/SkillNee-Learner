import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  AppNotification,
  NotificationsListResponse,
  NotificationsPagination,
  NotificationsQuery,
} from '@/types/notifications';

/** Student notification APIs — all routes require authentication. */

interface NotificationsListRaw {
  success: boolean;
  data: AppNotification[];
  pagination: NotificationsPagination;
}

export async function listNotifications(
  query: NotificationsQuery = {}
): Promise<NotificationsListResponse> {
  const params: Record<string, string | number | boolean> = {};
  if (query.page !== undefined) params.page = query.page;
  if (query.limit !== undefined) params.limit = query.limit;
  if (query.isRead !== undefined) params.isRead = query.isRead;
  if (query.type) params.type = query.type;

  const res = await apiClient.get<NotificationsListRaw>('/student/notifications', { params });
  return { data: res.data.data, pagination: res.data.pagination };
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const res = await apiClient.patch<ApiEnvelope<AppNotification>>(
    `/notifications/${encodeURIComponent(id)}/read`
  );
  return res.data.data;
}

export async function markAllNotificationsRead(): Promise<{ modified: number }> {
  const res = await apiClient.patch<ApiEnvelope<{ modified: number }>>(
    '/notifications/read-all'
  );
  return res.data.data;
}

export async function deleteNotification(id: string): Promise<AppNotification> {
  const res = await apiClient.delete<ApiEnvelope<AppNotification>>(
    `/notifications/${encodeURIComponent(id)}`
  );
  return res.data.data;
}
