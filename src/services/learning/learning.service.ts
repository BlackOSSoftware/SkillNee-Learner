import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  CompleteLessonResult,
  CourseProgress,
  LearningCurriculum,
  LearningLesson,
  LessonAttachment,
  PlaybackAuth,
} from '@/types/learning';

/** Authenticated learning APIs — enrollment-gated, backend enforces access. */

export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  const res = await apiClient.get<ApiEnvelope<{ progress: CourseProgress }>>(
    `/student/courses/${encodeURIComponent(courseId)}/progress`
  );
  return res.data.data.progress;
}

export async function getLearningCurriculum(courseId: string): Promise<LearningCurriculum> {
  const res = await apiClient.get<ApiEnvelope<LearningCurriculum>>(
    `/learning/courses/${encodeURIComponent(courseId)}/curriculum`
  );
  return res.data.data;
}

export async function getLearningLesson(lessonId: string): Promise<LearningLesson> {
  const res = await apiClient.get<ApiEnvelope<LearningLesson>>(
    `/learning/lessons/${encodeURIComponent(lessonId)}`
  );
  return res.data.data;
}

export async function getPlaybackAuth(lessonId: string): Promise<PlaybackAuth> {
  const res = await apiClient.get<ApiEnvelope<PlaybackAuth>>(
    `/learning/lessons/${encodeURIComponent(lessonId)}/video/playback`
  );
  return res.data.data;
}

/**
 * Renew an expired/expiring playback token. Same backend authorization as
 * getPlaybackAuth — verifies enrollment and returns a fresh signed token.
 */
export async function renewPlaybackToken(lessonId: string): Promise<PlaybackAuth> {
  const res = await apiClient.post<ApiEnvelope<PlaybackAuth>>(
    `/learning/lessons/${encodeURIComponent(lessonId)}/playback-token`
  );
  return res.data.data;
}

export async function listLessonAttachments(lessonId: string): Promise<LessonAttachment[]> {
  const res = await apiClient.get<ApiEnvelope<{ attachments: LessonAttachment[] }>>(
    `/learning/lessons/${encodeURIComponent(lessonId)}/attachments`
  );
  return res.data.data.attachments;
}

export async function completeLesson(
  lessonId: string,
  watchDurationSeconds?: number
): Promise<CompleteLessonResult> {
  const res = await apiClient.post<ApiEnvelope<CompleteLessonResult>>(
    `/student/lessons/${encodeURIComponent(lessonId)}/complete`,
    watchDurationSeconds != null ? { watchDurationSeconds } : {}
  );
  return res.data.data;
}

function filenameFromDisposition(header?: string): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(header);
  return match ? decodeURIComponent(match[1].trim()) : null;
}

async function downloadBlob(url: string): Promise<{ blob: Blob; filename: string }> {
  const res = await apiClient.get<Blob>(url, { responseType: 'blob' });
  const filename =
    filenameFromDisposition(res.headers['content-disposition']) || 'download';
  return { blob: res.data, filename };
}

export async function downloadLessonAttachment(
  lessonId: string,
  fileId: string
): Promise<{ blob: Blob; filename: string }> {
  return downloadBlob(
    `/learning/lessons/${encodeURIComponent(lessonId)}/attachments/${encodeURIComponent(fileId)}/download`
  );
}

export async function downloadResource(resourceId: string): Promise<{ blob: Blob; filename: string }> {
  return downloadBlob(`/learning/resources/${encodeURIComponent(resourceId)}/download`);
}
