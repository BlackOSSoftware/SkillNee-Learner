/** Course marketplace types — mirror backend public course API responses. */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CloudinaryMedia {
  provider?: 'cloudinary';
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type PricingType = 'free' | 'paid';
export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks';
export type CourseType = 'FREE' | 'PRE_RECORDED' | 'LIVE_SESSION';
export type EnrollmentEligibility = 'self_enroll' | 'payment_required' | 'application';

export interface CoursePricing {
  type?: PricingType | string;
  regularPrice?: number | null;
  salePrice?: number | null;
  currency?: string;
}

export interface CourseInstructor {
  id: string;
  firstName?: string;
  lastName?: string;
  profileImage?: CloudinaryMedia | null;
}

export interface CourseCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface CourseRating {
  averageRating: number;
  approvedReviewCount: number;
}

export interface CourseCard {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnail?: CloudinaryMedia | null;
  level?: CourseLevel | string;
  language?: string;
  courseType?: CourseType;
  actionLabel?: string;
  enrollmentEligibility?: EnrollmentEligibility;
  durationValue?: number;
  durationUnit?: DurationUnit | string;
  isFeatured?: boolean;
  pricing?: CoursePricing;
  categories?: CourseCategoryRef[];
  instructors?: CourseInstructor[];
  rating?: CourseRating;
  publishedAt?: string;
}

export interface CourseReview {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt?: string;
  student?: { firstName?: string; lastName?: string } | null;
}

export interface CourseLearningObjective {
  title: string;
  description?: string;
}

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface CourseLiveSession {
  batchName?: string;
  startDate?: string | null;
  endDate?: string | null;
  sessionMode?: string;
  sessionSchedule?: string;
}

export interface CourseDetail extends CourseCard {
  description?: string;
  liveSession?: CourseLiveSession | null;
  gallery?: CloudinaryMedia[];
  learningObjectives?: CourseLearningObjective[];
  requirements?: string[];
  targetAudience?: string[];
  faqs?: CourseFaq[];
  tags?: string[];
  certificate?: { enabled?: boolean; minimumCompletionPercentage?: number };
  seo?: Record<string, unknown>;
  reviews?: CourseReview[];
  enrolled: boolean;
}

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: CloudinaryMedia | null;
  parentCategoryId?: string | null;
  sortOrder?: number;
}

export interface CourseListParams {
  search?: string;
  categoryId?: string;
  level?: CourseLevel;
  language?: string;
  pricingType?: PricingType;
  courseType?: CourseType;
  page?: number;
  limit?: number;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  slug?: string;
  type?: 'video' | 'text' | 'live' | 'resource' | string;
  durationSeconds?: number;
  isPreview?: boolean;
  isRequired?: boolean;
  sortOrder?: number;
  status?: string;
  scheduledAt?: string | null;
  locked?: boolean;
  description?: string;
}

export interface CurriculumTopic {
  id: string;
  title: string;
  description?: string;
  sortOrder?: number;
  locked?: boolean;
  lessons: CurriculumLesson[];
}

export interface CourseCurriculum {
  course: { id: string; title: string; slug: string };
  enrolled: boolean;
  topics: CurriculumTopic[];
}
