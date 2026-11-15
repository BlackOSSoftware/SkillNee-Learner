import {
  Award,
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  ShoppingCart,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Student navigation — every item maps to a real backend module
 * (see docs/student-api-inventory.md). No imaginary modules.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Cart', href: '/cart', icon: ShoppingCart },
    ],
  },
  {
    label: 'My Learning',
    items: [
      { label: 'Browse Courses', href: '/courses', icon: BookOpen },
      { label: 'My Courses', href: '/my-courses', icon: GraduationCap },
      { label: 'Assignments', href: '/assignments', icon: ClipboardList },
      { label: 'Quizzes', href: '/quizzes', icon: HelpCircle },
      { label: 'Certificates', href: '/certificates', icon: Award },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Orders', href: '/orders', icon: Receipt },
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Support', href: '/support', icon: LifeBuoy },
      { label: 'Profile', href: '/profile', icon: User },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function findNavItem(pathname: string): NavItem | undefined {
  // Longest-prefix match so /my-courses/123 resolves to My Courses.
  return ALL_ITEMS
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
