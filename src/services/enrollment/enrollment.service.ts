import { apiClient } from '@/lib/api-client';
import type { ApiEnvelope } from '@/types/api';
import type {
  MyCoursesFilter,
  MyCoursesResponse,
  StudentDashboard,
} from '@/types/enrollment';

/** Authenticated student enrollment APIs. */

export async function getStudentDashboard(): Promise<StudentDashboard> {
  const res = await apiClient.get<ApiEnvelope<{ dashboard: StudentDashboard }>>('/student/dashboard');
  return res.data.data.dashboard;
}

export async function listMyCourses(filter: MyCoursesFilter = 'all'): Promise<MyCoursesResponse> {
  const res = await apiClient.get<ApiEnvelope<MyCoursesResponse>>('/student/my-courses', {
    params: { filter },
  });
  return res.data.data;
}

/** Direct self-enrollment for FREE courses — no payment involved. */
export async function enrollFreeCourse(courseId: string): Promise<unknown> {
  const res = await apiClient.post<ApiEnvelope<{ enrollment: unknown }>>('/student/enrollments', {
    courseId,
  });
  return res.data.data.enrollment;
}
