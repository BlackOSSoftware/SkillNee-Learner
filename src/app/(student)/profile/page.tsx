import type { Metadata } from 'next';
import { ProfilePage as ProfileView } from '@/components/profile/profile-page';

export const metadata: Metadata = { title: 'My Profile' };

export default function ProfilePage() {
  return <ProfileView />;
}
