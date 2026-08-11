import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Recuperar contraseña',
  path: '/recuperar-password',
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">¿Olvidaste tu contraseña?</h1>
      <p className="mt-1.5 text-sm text-ink-600">
        Ingresa tu correo y te enviaremos instrucciones para crear una nueva.
      </p>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
