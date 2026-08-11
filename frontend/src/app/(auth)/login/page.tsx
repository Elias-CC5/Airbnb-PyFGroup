import { AuthScrollShell } from '@/features/auth/components/AuthScrollShell';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { buildMetadata } from '@/lib/seo';
import { Suspense } from 'react';

export const metadata = buildMetadata({ title: 'Iniciar sesión', path: '/login', noIndex: true });

export default function LoginPage() {
  return (
    <AuthScrollShell
      headline={
        <span>
          Tus reservas, en un solo lugar. <br /> Entra y continúa.
        </span>
      }
    >
      <LoginForm />
    </AuthScrollShell>
  );
}