import { LoginForm } from '@/features/auth/components/LoginForm';
import { buildMetadata } from '@/lib/seo';
import { Suspense } from 'react';

export const metadata = buildMetadata({ title: 'Iniciar sesión', path: '/login', noIndex: true });

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Bienvenido de vuelta</h1>
      <p className="mt-1.5 text-sm text-ink-600">Ingresa para gestionar tus reservas y favoritos.</p>

      <div className="mt-8">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
