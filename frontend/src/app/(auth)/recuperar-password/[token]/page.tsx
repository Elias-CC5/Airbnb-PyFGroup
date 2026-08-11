import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({ title: 'Nueva contraseña', noIndex: true });

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Crea una nueva contraseña</h1>
      <p className="mt-1.5 text-sm text-ink-600">Elige una contraseña segura que no uses en otros sitios.</p>

      <div className="mt-8">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
