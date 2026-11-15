'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  getQuizAttemptResult,
  getStudentQuiz,
  listStudentQuizzes,
  startQuiz,
  submitQuizAttempt,
  type ListStudentQuizzesParams,
} from '@/services/quizzes/quizzes.service';
import type { QuizAnswerSubmission } from '@/types/quizzes';

export function useStudentQuizzes(params: ListStudentQuizzesParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quizzes.list(params as Record<string, unknown>),
    queryFn: () => listStudentQuizzes(params),
    enabled,
    staleTime: 30_000,
  });
}

export function useStudentQuiz(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quizzes.detail(id ?? ''),
    queryFn: () => getStudentQuiz(id as string),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}

export function useStartQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => startQuiz(quizId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.quizzes.all });
    },
  });
}

export function useSubmitQuizAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: QuizAnswerSubmission[] }) =>
      submitQuizAttempt(attemptId, answers),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: queryKeys.quizzes.result(vars.attemptId) });
      void qc.invalidateQueries({ queryKey: queryKeys.quizzes.all });
    },
  });
}

export function useQuizAttemptResult(attemptId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.quizzes.result(attemptId ?? ''),
    queryFn: () => getQuizAttemptResult(attemptId as string),
    enabled: enabled && Boolean(attemptId),
    staleTime: 15_000,
    retry: (count, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 403) return false;
      return count < 2;
    },
  });
}
