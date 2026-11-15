# My Courses — API Inventory & Feature Mapping

Base URL: `http://localhost:5000/api/v1`. All endpoints require `authenticate` (HttpOnly cookie session) unless marked public. Backend enforces enrollment/ownership — the frontend never bypasses authorization.

## Integrated endpoints

| Endpoint | Method | Purpose | Frontend usage |
|---|---|---|---|
| `/student/my-courses?filter=` | GET | Enrolled courses list. Filters: `all`, `active`, `in_progress`, `completed`, `pending`, `not_started`, `expired` | `/my-courses` listing, dashboard continue-learning, cart suggestions |
| `/student/courses/:id/progress` | GET | Authoritative progress: `progressPercentage`, `completedLessonsCount`, `totalRequiredLessons`, `courseCompletionStatus`, `lessons[]` (per-lesson `completionStatus`), `nextIncompleteLesson`, `accessGranted` | `/my-courses/[courseId]` header + completion map |
| `/learning/courses/:courseId/curriculum` | GET | `{ course, enrolled, isStaff, topics[] }`; topics have `locked`, lessons are learner objects (`locked`, `content`, `isPreview`, `durationSeconds`, `type`) | Curriculum sidebar |
| `/learning/lessons/:lessonId` | GET | Protected lesson payload (text/live/video/resource content per `toLearnerObject`) | Lesson panel |
| `/learning/lessons/:lessonId/video/playback` | GET | `{ type:'uploaded', playbackToken, expiresIn, qualities, processingStatus }` or `{ type:'external', externalUrl }` | `usePlaybackAuth` → video stream URL |
| `/learning/lessons/:lessonId/video/stream?token=` | GET | Protected MP4 stream, HTTP Range supported (206 partial) | `<video src>` — token in query, cookies via same-site session |
| `/learning/lessons/:lessonId/playback-token` | POST | Phase-2 alias of playback auth | Not used (GET playback used) |
| `/learning/lessons/:lessonId/attachments` | GET | `{ attachments[] }`: id, title, description, resourceType, originalFileName, mimeType, sizeBytes, visibility | Lesson resources section |
| `/learning/lessons/:lessonId/attachments/:fileId/download` | GET | Authenticated file stream + `Content-Disposition` filename | Blob download via axios |
| `/learning/resources/:resourceId/download` | GET | Course-resource download (file stream or `{type:'redirect'}` external) | Available via service; lesson attachments use the lesson-scoped endpoint |
| `/student/lessons/:id/complete` | POST | Body `{ watchDurationSeconds? }` (strict — progress fields rejected). Returns `{ alreadyCompleted, lessonProgress, progress, course }` | "Mark as complete" button; invalidates progress/curriculum/my-courses/dashboard |

## Frontend modules

- `src/types/learning.ts` — progress, curriculum, lesson, playback, attachment, completion types
- `src/services/learning/learning.service.ts` — all API calls (axios, blob downloads)
- `src/hooks/learning/use-learning.ts` — TanStack Query hooks + `useCompleteLesson` mutation
- `src/components/learning/` — `enrolled-course-card`, `course-filters`, `curriculum-sidebar`, `lesson-panel`, `lesson-player`, `lesson-attachments`
- `src/app/(student)/my-courses/page.tsx` — listing with 7 backend filters + local search
- `src/app/(student)/my-courses/[courseId]/page.tsx` — learning workspace

## Security notes

- Playback token is short-lived JWT (`PLAYBACK_TOKEN_SECRET`), kept in React Query memory only — never localStorage.
- Stream URL carries `?token=`; backend verifies `sub` (user) + `lessonId` + expiry per request.
- Downloads go through authenticated axios blob requests — no public storage URLs exposed.
- Lesson completion is server-authoritative; client only sends optional `watchDurationSeconds`.

## Missing / unsupported backend functionality

- **Per-lesson completion for optional lessons** — `progress.lessons[]` only covers required lessons; optional-lesson completion state is not returned (curriculum shows them as incomplete).
- **Instructor name in curriculum response** — course header shows title/status only; instructor requires `GET /courses/:slug` (public) if needed.
- **Search on `/student/my-courses`** — not supported; local filtering applied client-side.
- **Pagination on `/student/my-courses`** — returns full list; no page/limit params.
- **Video resume position** — no backend endpoint to persist playback position; `watchDurationSeconds` is accepted on completion only.
