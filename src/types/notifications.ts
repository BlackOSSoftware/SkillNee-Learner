/** Notification types — mirrors backend AppNotification model. */

export type NotificationType =
  | 'account_created'
  | 'course_enrollment'
  | 'payment_successful'
  | 'payment_failed'
  | 'assignment_submitted'
  | 'assignment_evaluated'
  | 'quiz_result'
  | 'certificate_generated'
  | 'course_announcement'
  | 'password_reset'
  | 'custom'
  | 'qa_reply'
  | 'instructor_application'
  | 'referral_submitted'
  | 'blog_published'
  | 'newsletter_subscription';

export type NotificationCategory = string;

export interface NotificationData {
  courseId?: string;
  enrollmentId?: string;
  orderId?: string;
  orderNumber?: string;
  assignmentId?: string;
  score?: string;
  quizId?: string;
  certificateId?: string;
  certificateNumber?: string;
  announcementId?: string;
  batchId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  recipientRole: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  data: NotificationData;
  isRead: boolean;
  readAt: string | null;
  createdBy: string | null;
  deliveryStatus: 'pending' | 'sent' | 'partial' | 'failed' | 'skipped';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsListResponse {
  data: AppNotification[];
  pagination: NotificationsPagination;
}

export interface NotificationsQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}
