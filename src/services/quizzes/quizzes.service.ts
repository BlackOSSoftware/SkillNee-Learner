import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type { Pagination } from '@/types/courses';
import type {
  QuizAnswerSubmission,
  QuizAttemptResult,
  QuizAttemptStart,
  StudentQuizDetail,
  StudentQuizListItem,
} from '@/types/quizzes';

export interface ListStudentQuizzesParams {
  search?: string;
  courseId?: string;
  page?: number;
  limit?: number;
}

export async function listStudentQuizzes(
  params: ListStudentQuizzesParams = {}
): Promise<{ quizzes: StudentQuizListItem[]; pagination: Pagination }> {
  const res = await apiClient.get<
    ApiEnvelope<{ quizzes: StudentQuizListItem[] }> & { pagination: Pagination }
  >('/student/quizzes', { params });
  return { quizzes: res.data.data.quizzes, pagination: res.data.pagination };
}

export async function getStudentQuiz(id: string): Promise<StudentQuizDetail> {
  const res = await apiClient.get<ApiEnvelope<StudentQuizDetail>>(
    `/student/quizzes/${encodeURIComponent(id)}`
  );
  return res.data.data;
}

export async function startQuiz(id: string): Promise<QuizAttemptStart> {
  const res = await apiClient.post<ApiEnvelope<QuizAttemptStart>>(
    `/student/quizzes/${encodeURIComponent(id)}/start`
  );
  return res.data.data;
}

export async function submitQuizAttempt(
  attemptId: string,
  answers: QuizAnswerSubmission[]
): Promise<QuizAttemptResult> {
  const res = await apiClient.post<ApiEnvelope<{ result: QuizAttemptResult }>>(
    `/student/quiz-attempts/${encodeURIComponent(attemptId)}/submit`,
    { answers }
  );
  return res.data.data.result;
}

export async function getQuizAttemptResult(attemptId: string): Promise<QuizAttemptResult> {
  const res = await apiClient.get<ApiEnvelope<{ result: QuizAttemptResult }>>(
    `/student/quiz-attempts/${encodeURIComponent(attemptId)}/result`
  );
  return res.data.data.result;
}
