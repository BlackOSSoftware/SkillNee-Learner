'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  enrollFreeCourse,
  getStudentDashboard,
  listMyCourses,
} from '@/services/enrollment/enrollment.service';
import { queryKeys } from '@/lib/query-keys';
import type { MyCoursesFilter } from '@/types/enrollment';

export function useStudentDashboard(enabled = true) {
  return useQuery({
    queryKey: queryKeys.enrollment.dashboard,
    queryFn: getStudentDashboard,
    enabled,
    staleTime: 60_000,
  });
}

export function useMyCourses(filter: MyCoursesFilter = 'all', enabled = true) {
  return useQuery({
    queryKey: queryKeys.enrollment.myCourses(filter),
    queryFn: () => listMyCourses(filter),
    enabled,
    staleTime: 60_000,
  });
}

/** Direct enrollment for FREE courses — invalidates enrollment queries on success. */
export function useEnrollFree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => enrollFreeCourse(courseId),
    onSuccess: (_data, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail('') });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      void courseId;
    },
  });
}
