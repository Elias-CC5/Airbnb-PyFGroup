import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Crear cuenta',
  description: 'Regístrate gratis en Airbnb PyFGroup para reservar alojamientos en todo el país.',
  path: '/registro',
});

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Crea tu cuenta</h1>
      <p className="mt-1.5 text-sm text-ink-600">Toma menos de un minuto y es gratis.</p>

      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
