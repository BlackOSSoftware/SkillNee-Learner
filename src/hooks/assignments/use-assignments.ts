'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAssignment,
  getSubmission,
  getSubmissionFeedback,
  listAssignments,
  listMySubmissions,
  submitAssignment,
} from '@/services/assignments/assignments.service';
import { queryKeys } from '@/lib/query-keys';
import type {
  MySubmissionsParams,
  StudentAssignmentListParams,
  SubmitAssignmentInput,
} from '@/types/assignments';

export function useAssignments(params: StudentAssignmentListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.assignments.list({ ...params }),
    queryFn: () => listAssignments(params),
    enabled,
    staleTime: 30_000,
  });
}

export function useAssignmentDetail(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.assignments.detail(id ?? ''),
    queryFn: () => getAssignment(id as string),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}

export function useMySubmissions(params: MySubmissionsParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.assignments.mySubmissions({ ...params }),
    queryFn: () => listMySubmissions(params),
    enabled,
    staleTime: 30_000,
  });
}

export function useSubmission(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.assignments.submission(id ?? ''),
    queryFn: () => getSubmission(id as string),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}

export function useSubmissionFeedback(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.assignments.feedback(id ?? ''),
    queryFn: () => getSubmissionFeedback(id as string),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}

/**
 * Accurate dashboard stats.
 *
 * The assignments list endpoint applies submission-status filters in memory
 * AFTER pagination, so its `pagination.total` does not reflect those filters.
 * The my-submissions endpoint filters at the DB level, so its totals are exact.
 * We therefore derive every stat from real backend counts:
 *  - total assignments  → assignments list total (no submission filter)
 *  - total submissions  → my-submissions total
 *  - pending            → total assignments − total submissions
 *    (unique index guarantees ≤1 submission per student per assignment)
 *  - submitted          → my-submissions with status submitted/under_review/resubmitted
 *  - graded             → my-submissions with status evaluated
 */
export function useAssignmentStats(enabled = true) {
  const totalAssignments = useAssignments({ limit: 1 }, enabled);
  const totalSubmissions = useMySubmissions({ limit: 1 }, enabled);
  const submitted = useMySubmissions({ status: 'submitted', limit: 1 }, enabled);
  const underReview = useMySubmissions({ status: 'under_review', limit: 1 }, enabled);
  const resubmitted = useMySubmissions({ status: 'resubmitted', limit: 1 }, enabled);
  const evaluated = useMySubmissions({ status: 'evaluated', limit: 1 }, enabled);

  const total = totalAssignments.data?.pagination.total ?? null;
  const submissions = totalSubmissions.data?.pagination.total ?? null;
  const pending =
    total != null && submissions != null ? Math.max(0, total - submissions) : null;
  const submittedCount =
    submitted.data != null && underReview.data != null && resubmitted.data != null
      ? (submitted.data.pagination.total ?? 0) +
        (underReview.data.pagination.total ?? 0) +
        (resubmitted.data.pagination.total ?? 0)
      : null;
  const gradedCount = evaluated.data?.pagination.total ?? null;

  const loading =
    totalAssignments.isPending ||
    totalSubmissions.isPending ||
    submitted.isPending ||
    underReview.isPending ||
    resubmitted.isPending ||
    evaluated.isPending;

  const refetch = () => {
    void totalAssignments.refetch();
    void totalSubmissions.refetch();
    void submitted.refetch();
    void underReview.refetch();
    void resubmitted.refetch();
    void evaluated.refetch();
  };

  return {
    total,
    pending,
    submitted: submittedCount,
    graded: gradedCount,
    loading,
    refetch,
  };
}

/**
 * Submit (or resubmit) an assignment. Invalidates the assignment detail, the
 * assignment lists and the submission history so every view reflects the
 * actual backend status.
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
      onUploadProgress,
    }: {
      id: string;
      input: SubmitAssignmentInput;
      onUploadProgress?: (percent: number) => void;
    }) => submitAssignment(id, input, onUploadProgress),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.assignments.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: ['enrollment'] });
    },
  });
}
