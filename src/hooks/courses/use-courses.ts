'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  getCourseBySlug,
  getCourseCurriculum,
  listCourseCategories,
  listCourses,
  listFeaturedCourses,
} from '@/services/courses/courses.service';
import type { CourseListParams } from '@/types/courses';

export function useCourses(params: CourseListParams) {
  return useQuery({
    queryKey: queryKeys.courses.list({ ...params }),
    queryFn: () => listCourses(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useFeaturedCourses(enabled = true) {
  return useQuery({
    queryKey: queryKeys.courses.featured,
    queryFn: listFeaturedCourses,
    enabled,
    staleTime: 60_000,
  });
}

export function useCourseCategories() {
  return useQuery({
    queryKey: queryKeys.courses.categories,
    queryFn: listCourseCategories,
    staleTime: 5 * 60_000,
  });
}

export function useCourseDetail(slug: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(slug),
    queryFn: () => getCourseBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function useCourseCurriculum(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.courses.curriculum(slug),
    queryFn: () => getCourseCurriculum(slug),
    enabled: enabled && Boolean(slug),
    staleTime: 60_000,
  });
}
