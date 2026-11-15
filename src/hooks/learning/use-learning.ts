'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeLesson,
  getCourseProgress,
  getLearningCurriculum,
  getLearningLesson,
  getPlaybackAuth,
  listLessonAttachments,
  renewPlaybackToken,
} from '@/services/learning/learning.service';
import { queryKeys } from '@/lib/query-keys';

export function useCourseProgress(courseId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.learning.progress(courseId),
    queryFn: () => getCourseProgress(courseId),
    enabled: enabled && Boolean(courseId),
    staleTime: 30_000,
  });
}

export function useLearningCurriculum(courseId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.learning.curriculum(courseId),
    queryFn: () => getLearningCurriculum(courseId),
    enabled: enabled && Boolean(courseId),
    staleTime: 60_000,
  });
}

export function useLearningLesson(lessonId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.learning.lesson(lessonId ?? ''),
    queryFn: () => getLearningLesson(lessonId as string),
    enabled: enabled && Boolean(lessonId),
    staleTime: 60_000,
  });
}

export function useLessonAttachments(lessonId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.learning.attachments(lessonId ?? ''),
    queryFn: () => listLessonAttachments(lessonId as string),
    enabled: enabled && Boolean(lessonId),
    staleTime: 60_000,
  });
}

/**
 * Short-lived playback authorization. Kept in memory only (React Query cache);
 * never persisted to localStorage. Refetches when the lesson changes.
 */
export function usePlaybackAuth(lessonId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.learning.playback(lessonId ?? ''),
    queryFn: () => getPlaybackAuth(lessonId as string),
    enabled: enabled && Boolean(lessonId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

/**
 * Renew a playback token (POST /learning/lessons/:id/playback-token). Returns
 * the same PlaybackAuth payload; the player swaps the stream URL and resumes.
 */
export function useRenewPlaybackToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => renewPlaybackToken(lessonId),
    // Apply the fresh authorization to the playback query so the player's
    // streamUrl changes and the <video> remounts with the new token.
    onSuccess: (data, lessonId) => {
      queryClient.setQueryData(queryKeys.learning.playback(lessonId), data);
    },
  });
}

export function useCompleteLesson(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, watchDurationSeconds }: { lessonId: string; watchDurationSeconds?: number }) =>
      completeLesson(lessonId, watchDurationSeconds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.learning.progress(courseId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.learning.curriculum(courseId) });
      void queryClient.invalidateQueries({ queryKey: ['enrollment'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.enrollment.dashboard });
    },
  });
}
