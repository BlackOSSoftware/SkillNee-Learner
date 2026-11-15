export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  courses: {
    all: ['courses'] as const,
    list: (params: Record<string, unknown>) => ['courses', 'list', params] as const,
    featured: ['courses', 'featured'] as const,
    categories: ['courses', 'categories'] as const,
    detail: (slug: string) => ['courses', 'detail', slug] as const,
    curriculum: (slug: string) => ['courses', 'curriculum', slug] as const,
  },
  cart: {
    all: ['cart'] as const,
    detail: ['cart', 'detail'] as const,
  },
  checkout: {
    order: (orderId: string) => ['checkout', 'order', orderId] as const,
  },
  coupons: {
    validate: ['coupons', 'validate'] as const,
  },
  payments: {
    gateways: (orderId: string) => ['payments', 'gateways', orderId] as const,
  },
  enrollment: {
    dashboard: ['enrollment', 'dashboard'] as const,
    myCourses: (filter: string) => ['enrollment', 'my-courses', filter] as const,
    enroll: (courseId: string) => ['enrollment', 'enroll', courseId] as const,
  },
  liveApplications: {
    mine: ['live-applications', 'mine'] as const,
  },
  learning: {
    progress: (courseId: string) => ['learning', 'progress', courseId] as const,
    curriculum: (courseId: string) => ['learning', 'curriculum', courseId] as const,
    lesson: (lessonId: string) => ['learning', 'lesson', lessonId] as const,
    attachments: (lessonId: string) => ['learning', 'attachments', lessonId] as const,
    playback: (lessonId: string) => ['learning', 'playback', lessonId] as const,
  },
  assignments: {
    all: ['assignments'] as const,
    list: (params: Record<string, unknown>) => ['assignments', 'list', params] as const,
    detail: (id: string) => ['assignments', 'detail', id] as const,
    mySubmissions: (params: Record<string, unknown>) => ['assignments', 'my-submissions', params] as const,
    submission: (id: string) => ['assignments', 'submission', id] as const,
    feedback: (id: string) => ['assignments', 'feedback', id] as const,
  },
  quizzes: {
    all: ['quizzes'] as const,
    list: (params: Record<string, unknown>) => ['quizzes', 'list', params] as const,
    detail: (id: string) => ['quizzes', 'detail', id] as const,
    attempt: (attemptId: string) => ['quizzes', 'attempt', attemptId] as const,
    result: (attemptId: string) => ['quizzes', 'result', attemptId] as const,
  },
  certificates: {
    all: ['certificates'] as const,
    list: ['certificates', 'list'] as const,
    detail: (id: string) => ['certificates', 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: ['orders', 'list'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params: Record<string, unknown>) => ['notifications', 'list', params] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
    latest: ['notifications', 'latest'] as const,
  },
  support: {
    all: ['support'] as const,
    list: (params: Record<string, unknown>) => ['support', 'list', params] as const,
    detail: (id: string) => ['support', 'detail', id] as const,
  },
} as const;
