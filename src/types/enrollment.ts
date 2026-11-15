/** Student enrollment & dashboard types — mirrors backend enrollment module responses. */

export interface StudentDashboardTotals {
  enrolledCourses: number;
  activeCourses: number;
  inProgressCourses: number;
  completedCourses: number;
  pendingCourses: number;
  expiredCourses: number;
  revokedCourses: number;
  completedRequiredLessons: number;
}

export interface UpcomingAssignment {
  id: string;
  title: string;
  dueDate: string | null;
  courseId: string;
  maximumMarks: number | null;
}

export interface RecentlyAccessedCourse {
  enrollmentId: string;
  courseId?: string;
  title?: string;
  slug?: string;
  lastAccessedAt?: string;
  progressPercentage?: number;
}

export interface RecentlyCompletedLesson {
  lessonId: string;
  courseId: string;
  completedAt: string;
}

export interface StudentDashboard {
  totals: StudentDashboardTotals;
  upcomingAssignments: UpcomingAssignment[];
  pendingAssignmentEvaluations: number;
  pendingRequiredQuizzes: number;
  recentlyAccessedCourses: RecentlyAccessedCourse[];
  recentlyCompletedLessons: RecentlyCompletedLesson[];
}

export interface MyCourseNextLesson {
  lessonId?: string;
  title?: string;
  [key: string]: unknown;
}

export interface MyCourse {
  enrollmentId: string;
  enrollmentStatus: string;
  enrollmentType?: string;
  enrolledAt?: string;
  enrollmentExpiresAt?: string | null;
  progressPercentage: number;
  completedLessonsCount?: number;
  totalRequiredLessons?: number;
  courseCompletionStatus?: string;
  lastAccessedAt?: string;
  completedAt?: string;
  nextIncompleteLesson?: MyCourseNextLesson | null;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: { secureUrl?: string; url?: string } | null;
    status?: string;
    pricing?: { pricingType?: string; currency?: string };
    level?: string;
  };
}

export interface MyCoursesResponse {
  courses: MyCourse[];
}

export type MyCoursesFilter =
  | 'all'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'pending'
  | 'not_started'
  | 'expired';
