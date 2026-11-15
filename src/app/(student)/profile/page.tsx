import { User } from 'lucide-react';
import { ModulePlaceholder } from '@/components/layout/module-placeholder';

export default function ProfilePage() {
  return (
    <ModulePlaceholder
      icon={User}
      title="My Profile"
      description="View your account details, role, verification status and membership info. Profile editing is pending a backend update endpoint."
      apis={['GET /auth/me']}
    />
  );
}
