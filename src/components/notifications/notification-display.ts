import {
  Award,
  Bell,
  BookOpen,
  ClipboardList,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { AppNotification, NotificationType } from '@/types/notifications';

/** Maps notification type to a Lucide icon. */
export function notificationIcon(type: NotificationType): LucideIcon {
  switch (type) {
    case 'account_created':
      return User;
    case 'course_enrollment':
      return BookOpen;
    case 'payment_successful':
    case 'payment_failed':
      return CreditCard;
    case 'assignment_submitted':
    case 'assignment_evaluated':
      return ClipboardList;
    case 'quiz_result':
      return HelpCircle;
    case 'certificate_generated':
      return Award;
    case 'course_announcement':
      return Bell;
    case 'password_reset':
      return Mail;
    case 'qa_reply':
      return MessageSquare;
    case 'custom':
      return LifeBuoy;
    case 'instructor_application':
    case 'referral_submitted':
    case 'blog_published':
    case 'newsletter_subscription':
    default:
      return Bell;
  }
}

/** Maps notification type to a color tone for the icon background. */
export function notificationTone(type: NotificationType): string {
  switch (type) {
    case 'payment_successful':
    case 'certificate_generated':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'payment_failed':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
    case 'assignment_evaluated':
    case 'quiz_result':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'course_enrollment':
    case 'course_announcement':
      return 'bg-primary/10 text-primary';
    case 'account_created':
    case 'password_reset':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400';
    case 'qa_reply':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
    case 'custom':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';
    default:
      return 'bg-surface-2 text-ink-muted';
  }
}

/** Resolves the in-app destination for a notification, if any. */
export function notificationDestination(n: AppNotification): string | null {
  const d = n.data || {};
  switch (n.type) {
    case 'assignment_submitted':
    case 'assignment_evaluated':
      return d.assignmentId ? `/assignments/${d.assignmentId}` : '/assignments';
    case 'quiz_result':
      return '/quizzes';
    case 'certificate_generated':
      return d.certificateId ? `/certificates/${d.certificateId}` : '/certificates';
    case 'payment_successful':
    case 'payment_failed':
      return d.orderId ? `/orders/${d.orderId}` : '/orders';
    case 'course_enrollment':
      return '/my-courses';
    case 'course_announcement':
      return d.courseId ? `/courses` : '/courses';
    case 'qa_reply':
      return '/support';
    case 'custom':
      if (n.category === 'support') {
        return d.ticketId ? `/support/${d.ticketId}` : '/support';
      }
      return null;
    case 'account_created':
      return '/dashboard';
    default:
      return null;
  }
}

/** Human-readable type label. */
export function notificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case 'account_created': return 'Account';
    case 'course_enrollment': return 'Enrollment';
    case 'payment_successful': return 'Payment';
    case 'payment_failed': return 'Payment';
    case 'assignment_submitted': return 'Assignment';
    case 'assignment_evaluated': return 'Assignment';
    case 'quiz_result': return 'Quiz';
    case 'certificate_generated': return 'Certificate';
    case 'course_announcement': return 'Announcement';
    case 'password_reset': return 'Account';
    case 'custom': return 'General';
    case 'qa_reply': return 'Support';
    case 'instructor_application': return 'Application';
    case 'referral_submitted': return 'Referral';
    case 'blog_published': return 'Blog';
    case 'newsletter_subscription': return 'Newsletter';
    default: return 'General';
  }
}

/** Relative time string (e.g. "2m ago", "3h ago", "Yesterday"). */
export function relativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Absolute date-time for tooltips / detail views. */
export function absoluteTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
