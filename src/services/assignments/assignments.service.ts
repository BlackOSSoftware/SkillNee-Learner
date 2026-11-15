import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  AssignmentDetail,
  AssignmentSubmission,
  MySubmissionsParams,
  MySubmissionsResult,
  StudentAssignmentListParams,
  StudentAssignmentListResult,
  SubmissionFeedback,
  SubmitAssignmentInput,
} from '@/types/assignments';
import type { Pagination } from '@/types/courses';

function compactParams(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

/** Authenticated student assignment APIs — backend enforces enrollment & rules. */

export async function listAssignments(
  params: StudentAssignmentListParams = {}
): Promise<StudentAssignmentListResult> {
  const res = await apiClient.get<
    ApiEnvelope<{ assignments: StudentAssignmentListResult['assignments'] }> & { pagination: Pagination }
  >('/student/assignments', { params: compactParams({ ...params }) });
  return { assignments: res.data.data.assignments, pagination: res.data.pagination };
}

export async function listMySubmissions(
  params: MySubmissionsParams = {}
): Promise<MySubmissionsResult> {
  const res = await apiClient.get<
    ApiEnvelope<{ submissions: AssignmentSubmission[] }> & { pagination: Pagination }
  >('/student/assignments/my-submissions', { params: compactParams({ ...params }) });
  return { submissions: res.data.data.submissions, pagination: res.data.pagination };
}

export async function getAssignment(id: string): Promise<AssignmentDetail> {
  const res = await apiClient.get<ApiEnvelope<AssignmentDetail>>(
    `/student/assignments/${encodeURIComponent(id)}`
  );
  return res.data.data;
}

/**
 * Multipart submission. The shared apiClient instance defaults to
 * `Content-Type: application/json`; for FormData that header must be removed
 * per-request so the browser/axios sets `multipart/form-data` with the correct
 * boundary. Without this, the body reaches the backend as a non-multipart
 * payload and the file field leaks into the JSON body validator.
 */
export async function submitAssignment(
  id: string,
  input: SubmitAssignmentInput,
  onUploadProgress?: (percent: number) => void
): Promise<AssignmentSubmission> {
  const form = new FormData();
  if (input.textContent != null && input.textContent !== '') {
    form.append('textContent', input.textContent);
  }
  for (const file of input.files ?? []) {
    form.append('files', file);
  }
  const res = await apiClient.post<ApiEnvelope<{ submission: AssignmentSubmission }>>(
    `/student/assignments/${encodeURIComponent(id)}/submit`,
    form,
    {
      headers: { 'Content-Type': undefined },
      onUploadProgress: (e) => {
        if (onUploadProgress && e.total) {
          onUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    }
  );
  return res.data.data.submission;
}

export async function getSubmission(id: string): Promise<AssignmentSubmission> {
  const res = await apiClient.get<ApiEnvelope<{ submission: AssignmentSubmission }>>(
    `/student/submissions/${encodeURIComponent(id)}`
  );
  return res.data.data.submission;
}

export async function getSubmissionFeedback(id: string): Promise<SubmissionFeedback> {
  const res = await apiClient.get<ApiEnvelope<{ feedback: SubmissionFeedback }>>(
    `/student/submissions/${encodeURIComponent(id)}/feedback`
  );
  return res.data.data.feedback;
}

function filenameFromDisposition(header?: string): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(header);
  return match ? decodeURIComponent(match[1].trim()) : null;
}

/** Authorized download of a student's own submitted attachment. */
export async function downloadSubmissionAttachment(
  submissionId: string,
  attachmentId: string
): Promise<{ blob: Blob; filename: string }> {
  const res = await apiClient.get<Blob>(
    `/student/submissions/${encodeURIComponent(submissionId)}/attachments/${encodeURIComponent(attachmentId)}/download`,
    { responseType: 'blob' }
  );
  const filename =
    filenameFromDisposition(res.headers['content-disposition']) || 'attachment';
  return { blob: res.data, filename };
}
