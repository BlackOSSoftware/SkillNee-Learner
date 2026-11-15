/** Assignment module types — mirror backend student assignment APIs exactly. */

import type { Pagination } from './courses';

export type AssignmentStatus = 'draft' | 'published' | 'closed' | 'archived';

export type AssignmentSubmissionType = 'file_upload' | 'text' | 'file_and_text';

export type SubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'evaluated'
  | 'returned'
  | 'resubmitted';

/** GET /student/assignments list filter values (backend enum). */
export type StudentAssignmentFilter =
  | 'upcoming'
  | 'past_due'
  | 'submitted'
  | 'pending_evaluation'
  | 'evaluated';

export interface Assignment {
  id: string;
  title: string;
  slug: string;
  instructions: string;
  courseId: string;
  topicId: string | null;
  lessonId: string | null;
  dueDate: string | null;
  maximumMarks: number;
  allowedFileTypes: string[];
  maximumFileSizeBytes: number;
  submissionType: AssignmentSubmissionType;
  allowLateSubmission: boolean;
  allowResubmission: boolean;
  maxSubmissions: number;
  status: AssignmentStatus;
  publishedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Compact submission summary embedded in the assignment list. */
export interface MySubmissionSummary {
  id: string;
  submissionStatus: SubmissionStatus;
  submittedAt: string;
  isLate: boolean;
  marksAwarded: number | null;
}

export interface StudentAssignmentListItem extends Assignment {
  mySubmission: MySubmissionSummary | null;
}

export interface StudentAssignmentListParams {
  courseId?: string;
  filter?: StudentAssignmentFilter;
  page?: number;
  limit?: number;
}

export interface StudentAssignmentListResult {
  assignments: StudentAssignmentListItem[];
  pagination: Pagination;
}

export interface AssignmentSubmissionAttachment {
  id: string;
  mediaAssetId: string | null;
  originalFileName: string;
  mimeType: string;
  extension: string | null;
  sizeBytes: number;
  downloadAvailable: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  courseId: string;
  lessonId: string | null;
  version: number;
  textContent: string;
  attachments: AssignmentSubmissionAttachment[];
  submittedAt: string;
  submissionStatus: SubmissionStatus;
  isLate: boolean;
  marksAwarded: number | null;
  feedback: string;
  evaluatedBy: string | null;
  evaluatedAt: string | null;
  evaluationHistory?: unknown[];
  versionHistory?: unknown[];
  createdAt: string;
  updatedAt: string;
}

/** GET /student/assignments/:id */
export interface AssignmentDetail {
  assignment: Assignment;
  mySubmission: AssignmentSubmission | null;
}

/** GET /student/assignments/my-submissions */
export interface MySubmissionsParams {
  assignmentId?: string;
  courseId?: string;
  status?: SubmissionStatus;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface MySubmissionsResult {
  submissions: AssignmentSubmission[];
  pagination: Pagination;
}

/** GET /student/submissions/:id/feedback */
export interface SubmissionFeedback {
  submissionId: string;
  submissionStatus: SubmissionStatus;
  marksAwarded: number | null;
  feedback: string;
  evaluatedAt: string | null;
}

export interface SubmitAssignmentInput {
  textContent?: string;
  files?: File[];
}
