import { ProfileView } from '@/features/auth/components/ProfileView';

export const metadata = { title: 'Mi perfil', robots: { index: false } };

export default function ProfilePage() {
  return <ProfileView />;
}
