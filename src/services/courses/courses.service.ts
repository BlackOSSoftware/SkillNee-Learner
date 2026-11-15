import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  CourseCard,
  CourseCategory,
  CourseCurriculum,
  CourseDetail,
  CourseListParams,
  Pagination,
} from '@/types/courses';

/** Public course catalog APIs — no auth required, cookies sent when present. */

export async function listCourses(params: CourseListParams): Promise<{
  courses: CourseCard[];
  pagination: Pagination;
}> {
  const res = await apiClient.get<ApiEnvelope<CourseCard[]> & { pagination: Pagination }>('/courses', {
    params: {
      search: params.search || undefined,
      categoryId: params.categoryId || undefined,
      level: params.level || undefined,
      language: params.language || undefined,
      pricingType: params.pricingType || undefined,
      courseType: params.courseType || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    },
  });
  return { courses: res.data.data, pagination: res.data.pagination };
}

export async function listFeaturedCourses(): Promise<CourseCard[]> {
  const res = await apiClient.get<ApiEnvelope<{ courses: CourseCard[] }>>('/courses/featured');
  return res.data.data.courses;
}

export async function listCourseCategories(): Promise<CourseCategory[]> {
  const res = await apiClient.get<ApiEnvelope<{ categories: CourseCategory[] }>>('/courses/categories');
  return res.data.data.categories;
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail> {
  const res = await apiClient.get<ApiEnvelope<{ course: CourseDetail }>>(`/courses/${encodeURIComponent(slug)}`);
  return res.data.data.course;
}

export async function getCourseCurriculum(slug: string): Promise<CourseCurriculum> {
  const res = await apiClient.get<ApiEnvelope<CourseCurriculum>>(
    `/courses/${encodeURIComponent(slug)}/curriculum`
  );
  return res.data.data;
}
