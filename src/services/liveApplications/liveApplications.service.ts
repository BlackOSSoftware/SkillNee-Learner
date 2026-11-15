import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  LiveCourseApplication,
  SubmitLiveApplicationInput,
} from '@/types/liveApplications';

/** Live course application APIs. */

export async function submitLiveApplication(
  input: SubmitLiveApplicationInput
): Promise<LiveCourseApplication> {
  const res = await apiClient.post<ApiEnvelope<{ application: LiveCourseApplication }>>(
    '/live-course-applications',
    input
  );
  return res.data.data.application;
}

export async function listMyLiveApplications(): Promise<LiveCourseApplication[]> {
  const res = await apiClient.get<ApiEnvelope<LiveCourseApplication[]>>(
    '/student/live-course-applications'
  );
  return res.data.data;
}
