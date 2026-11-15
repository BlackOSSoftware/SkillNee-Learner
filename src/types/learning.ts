/** Learning workspace types — mirrors backend /learning + /student progress APIs. */

import type { MyCoursesFilter } from './enrollment';

export type { MyCoursesFilter };

/* ---------- Course progress (GET /student/courses/:id/progress) ---------- */

export type LessonCompletionStatus = 'not_started' | 'in_progress' | 'completed';
export type CourseCompletionStatus =
  | 'not_started'
  | 'in_progress'
  | 'requirements_pending'
  | 'completed';

export interface ProgressLesson {
  lessonId: string;
  title: string;
  type: string;
  isRequired: boolean;
  completionStatus: LessonCompletionStatus;
  completedAt: string | null;
}

export interface CourseProgress {
  enrollmentId: string;
  courseId: string;
  studentId: string;
  enrollmentStatus: string;
  progressPercentage: number;
  completedLessonsCount: number;
  totalRequiredLessons: number;
  courseCompletionStatus: CourseCompletionStatus;
  completionEvaluationAt?: string | null;
  completedAt?: string | null;
  lastAccessedAt?: string | null;
  lessons: ProgressLesson[];
  nextIncompleteLesson: { lessonId: string; title: string; type: string } | null;
  accessGranted?: boolean;
}

/* ---------- Learning curriculum (GET /learning/courses/:courseId/curriculum) ---------- */

export type LessonType = 'video' | 'text' | 'live' | 'resource' | 'quiz' | 'assignment';

export interface LessonVideoInfo {
  source?: 'uploaded' | 'external';
  provider?: string;
  processingStatus?: string;
  durationSeconds?: number;
  availableQualities?: string[];
  externalUrl?: string;
}

export interface LessonLiveSession {
  meetingProvider?: string;
  meetingUrl?: string;
  startsAt?: string;
  endsAt?: string;
  timezone?: string;
  instructions?: string;
}

export interface LessonResourceContent {
  resourceIds?: string[];
  instructions?: string;
}

export interface LessonContent {
  textContent?: { body: string; format: 'html' | 'markdown' };
  video?: LessonVideoInfo;
  liveSession?: LessonLiveSession | null;
  resourceContent?: LessonResourceContent | null;
}

export interface LearningLesson {
  id: string;
  title: string;
  slug: string;
  type: LessonType | string;
  durationSeconds: number;
  isPreview: boolean;
  isRequired: boolean;
  sortOrder: number;
  status: string;
  scheduledAt?: string | null;
  locked?: boolean;
  description?: string;
  content?: LessonContent;
}

export interface LearningTopic {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  locked: boolean;
  lessons: LearningLesson[];
}

export interface LearningCurriculum {
  course: { id: string; title: string; slug: string; status: string };
  enrolled: boolean;
  isStaff: boolean;
  topics: LearningTopic[];
}

/* ---------- Playback (GET /learning/lessons/:id/video/playback) ---------- */

export interface UploadedPlayback {
  type: 'uploaded';
  playbackToken: string;
  expiresIn: string | number;
  qualities: string[];
  processingStatus: string;
}

export interface ExternalPlayback {
  type: 'external';
  externalUrl: string;
}

export type PlaybackAuth = UploadedPlayback | ExternalPlayback;

/* ---------- Attachments (GET /learning/lessons/:id/attachments) ---------- */

export interface LessonAttachment {
  id: string;
  title: string;
  description?: string;
  resourceType?: string;
  originalFileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  visibility?: string;
}

/* ---------- Lesson completion (POST /student/lessons/:id/complete) ---------- */

export interface LessonProgressSafe {
  id?: string;
  completionStatus?: string;
  completedAt?: string | null;
  [key: string]: unknown;
}

export interface CompleteLessonResult {
  alreadyCompleted: boolean;
  lessonProgress: LessonProgressSafe;
  progress: {
    enrollmentId: string;
    courseId: string;
    progressPercentage: number;
    completedLessonsCount: number;
    totalRequiredLessons: number;
    courseCompletionStatus: CourseCompletionStatus;
    enrollmentStatus: string;
  };
  course: { id: string; title: string };
}
