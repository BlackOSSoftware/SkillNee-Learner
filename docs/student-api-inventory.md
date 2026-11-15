# Student Dashboard — API Inventory & Page Mapping

Discovered from `backend/src/**` route mounts + validators (Swagger: `/api/v1/docs/`).
Base URL: `http://localhost:5000/api/v1`. All student endpoints require `authenticate` (HttpOnly cookie session) unless marked public.

## Auth (already integrated)

| Module | Endpoint | Method | Purpose | Student Access | Params | UI Page |
|---|---|---|---|---|---|---|
| Auth | `/auth/register` | POST | Create account | Yes | firstName, lastName, email, phone?, password | `/register` |
| Auth | `/auth/login` | POST | Login | Yes | email, password | `/login` |
| Auth | `/auth/refresh` | POST | Rotate session | Yes | refreshToken cookie | interceptor |
| Auth | `/auth/logout` | POST | Logout | Yes | — | topbar menu |
| Auth | `/auth/me` | GET | Current user | Yes | — | shell / profile |
| Auth | `/auth/forgot-password` | POST | Reset link | Yes | email | `/forgot-password` |
| Auth | `/auth/reset-password` | POST | Set new password | Yes | token, password | `/reset-password` |

## Student Profile

| Module | Endpoint | Method | Purpose | Student Access | Params | UI Page |
|---|---|---|---|---|---|---|
| Profile | `/auth/me` | GET | View own profile | Yes | — | `/profile` |

**Missing:** no `PATCH /auth/me` or profile-update endpoint; no avatar upload; no change-password endpoint (only forgot/reset flow). Profile page is view-only until backend adds update APIs.

## Course Catalog (public, `optionalAuthenticate`)

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Courses | `/courses` | GET | List published courses | search, categoryId, level, language, pricingType, isFeatured, page, limit | `/courses` |
| Courses | `/courses/featured` | GET | Featured courses | — | `/courses` |
| Courses | `/courses/categories` | GET | Public categories | — | `/courses` |
| Courses | `/course-categories` | GET | Category list | — | `/courses` |
| Courses | `/courses/:slug` | GET | Course detail | slug | `/courses/[slug]` (future) |
| Courses | `/courses/:slug/curriculum` | GET | Public curriculum | slug | course detail |
| Courses | `/courses/:id/reviews` | GET | Public reviews | id, page/limit | course detail |

## My Learning / Enrollments

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Enrollments | `/student/my-courses` | GET | Enrolled courses | filter: all/active/in_progress/completed/pending/not_started/expired | `/my-courses` |
| Enrollments | `/student/dashboard` | GET | Student dashboard summary | — | `/dashboard` |
| Enrollments | `/student/courses/:id/progress` | GET | Course progress | id | `/my-courses/[id]` |
| Progress | `/student/lessons/:id/complete` | POST | Mark lesson complete | id, body: watchDurationSeconds? | lesson player |
| Learning | `/learning/courses/:courseId/curriculum` | GET | Learning curriculum | courseId | course player |
| Learning | `/learning/lessons/:lessonId` | GET | Lesson content | lessonId | lesson player |
| Learning | `/learning/lessons/:lessonId/video/playback` | GET | Video playback info | lessonId | lesson player |
| Learning | `/learning/lessons/:lessonId/video/stream` | GET | Video stream (Range) | lessonId | lesson player |
| Learning | `/learning/lessons/:lessonId/playback-token` | POST | Playback token (alias) | lessonId | lesson player |
| Learning | `/learning/lessons/:lessonId/attachments` | GET | Lesson attachments | lessonId | lesson player |
| Learning | `/learning/lessons/:lessonId/attachments/:fileId/download` | GET | Download attachment | lessonId, fileId | lesson player |
| Learning | `/learning/resources/:resourceId/download` | GET | Download resource | resourceId | lesson player |
| Media | `/learning/media/:id/playback` | GET | Media playback | id | lesson player |
| Media | `/learning/media/:id/stream` | GET | Media stream | id | lesson player |

## Course Reviews

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Reviews | `/student/courses/:id/reviews` | POST | Create review | id, body | course detail |
| Reviews | `/student/reviews/:id` | PATCH | Update own review | id, body | course detail |

## Quizzes

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Quizzes | `/student/quizzes/:id/start` | POST | Start attempt | id (rate-limited) | `/quizzes` → quiz player |
| Quizzes | `/student/quiz-attempts/:id/submit` | POST | Submit answers | id, body: answers[] (rate-limited) | quiz player |
| Quizzes | `/student/quiz-attempts/:id/result` | GET | Attempt result | id | `/quizzes` results |

**Missing:** no "list my quizzes" or "list my attempts" endpoint — quizzes are discovered via course curriculum; a dedicated attempts history page is not supported yet.

## Assignments & Submissions

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Assignments | `/student/assignments` | GET | List assignments | courseId?, filter: upcoming/past_due/submitted/pending_evaluation/evaluated, page, limit | `/assignments` |
| Assignments | `/student/assignments/my-submissions` | GET | My submissions | assignmentId?, courseId?, status?, isLate?, search?, page, limit | `/assignments` |
| Assignments | `/student/assignments/:id` | GET | Assignment detail | id | `/assignments/[id]` |
| Submissions | `/student/assignments/:id/submit` | POST | Submit (multipart `files` ≤5 + textContent) | id, rate-limited | assignment detail |
| Submissions | `/student/submissions/:id` | GET | Own submission | id | submission view |
| Submissions | `/student/submissions/:id/feedback` | GET | Grading feedback | id | submission view |
| Submissions | `/student/submissions/:id/attachments/:attachmentId/download` | GET | Download submission file | id, attachmentId | submission view |

## Certificates

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Certificates | `/student/certificates` | GET | My certificates | — | `/certificates` |
| Certificates | `/student/certificates/:id` | GET | Certificate detail | id | `/certificates/[id]` |
| Certificates | `/student/certificates/:id/download` | GET | Download certificate | id | `/certificates` |
| Certificates | `/certificates/verify` | GET | Public verify (no auth) | — | — |

## Orders / Payments / Cart (commerce)

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Cart | `/student/cart` | GET | View cart | — | `/courses` checkout flow |
| Cart | `/student/cart/items` | POST | Add item | body: courseId | course detail |
| Cart | `/student/cart/items/:courseId` | DELETE | Remove item | courseId | cart |
| Cart | `/student/cart` | DELETE | Clear cart | — | cart |
| Checkout | `/student/checkout` | POST | Place order | body | checkout |
| Coupons | `/coupons/validate` | POST | Validate coupon | body | checkout |
| Orders | `/student/orders` | GET | My orders | — | `/orders` |
| Orders | `/student/orders/:id` | GET | Order detail | id | `/orders/[id]` |
| Orders | `/student/orders/:id/invoice` | GET | Invoice download | id | `/orders` |
| Payments | `/payments/available/:orderId` | GET | Available gateways | orderId | checkout |
| Payments | `/payments/razorpay/create-order` | POST | Razorpay order | body | checkout |
| Payments | `/payments/razorpay/verify` | POST | Verify payment | body | checkout |
| Payments | `/payments/paypal/create-order` | POST | PayPal order | body | checkout |
| Payments | `/payments/paypal/capture-order` | POST | Capture payment | body | checkout |

## Notifications

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Notifications | `/student/notifications` | GET | My notifications | page, limit, isRead, type | `/notifications` |
| Notifications | `/notifications/read-all` | PATCH | Mark all read | — | `/notifications` |
| Notifications | `/notifications/:id/read` | PATCH | Mark read | id | `/notifications` |
| Notifications | `/notifications/:id` | DELETE | Delete | id | `/notifications` |
| Devices | `/student/devices/register` | POST | Register push device | token, platform, deviceName? | future PWA |
| Devices | `/student/devices` | GET | List devices | — | settings (future) |
| Devices | `/student/devices/:id` | DELETE | Remove device | id | settings (future) |

## Q&A (course questions)

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Q&A | `/student/courses/:id/questions` | POST | Ask question | id, title, description, lessonId? | course Q&A tab |
| Q&A | `/student/questions` | GET | My questions | courseId?, status: open/resolved, sort, page, limit | `/questions` (future) |
| Q&A | `/student/questions/:id` | GET | Question detail | id | Q&A detail |
| Q&A | `/student/questions/:id/replies` | POST | Reply | id, message, attachments?, idempotencyKey? | Q&A detail |

## Support Tickets

| Module | Endpoint | Method | Purpose | Params | UI Page |
|---|---|---|---|---|---|
| Support | `/support/tickets` | POST | Create ticket | category, subject, description, priority? | `/support` |
| Support | `/support/tickets` | GET | My tickets | page, limit, status?, category? | `/support` |
| Support | `/support/tickets/:id` | GET | Ticket detail | id | `/support/[id]` |
| Support | `/support/tickets/:id/replies` | POST | Reply | id, message, attachments?, idempotencyKey? | ticket detail |

## Not student-accessible (excluded from nav)

- `/admin/**` — all admin routes require `requireAdminAccess`/permissions.
- Blogs, FAQs, newsletter, referrals, SEO, site settings, instructor applications — public/marketing endpoints, not dashboard modules.
- Attendance, fees ledger, dedicated results page — **no backend support**.

## Navigation mapping (implemented this phase)

| Route | Backing APIs | Status |
|---|---|---|
| `/dashboard` | `/auth/me`, `/student/dashboard` (future) | shell + placeholders |
| `/courses` | `/courses`, `/courses/featured`, `/courses/categories` | placeholder |
| `/my-courses` | `/student/my-courses`, `/student/courses/:id/progress` | placeholder |
| `/assignments` | `/student/assignments`, `/student/assignments/my-submissions` | placeholder |
| `/quizzes` | `/student/quizzes/:id/start`, `/student/quiz-attempts/*` | placeholder |
| `/certificates` | `/student/certificates*` | placeholder |
| `/orders` | `/student/orders*`, `/student/cart`, `/payments/*` | placeholder |
| `/notifications` | `/student/notifications`, `/notifications/*` | placeholder |
| `/support` | `/support/tickets*` | placeholder |
| `/profile` | `/auth/me` (view-only) | placeholder |
