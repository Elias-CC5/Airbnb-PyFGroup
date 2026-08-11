import { AuthScrollShell } from '@/features/auth/components/AuthScrollShell';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Crear cuenta',
  description: 'Regístrate gratis para reservar alojamientos en todo el Perú.',
  path: '/registro',
});

export default function RegisterPage() {
  return (
    <AuthScrollShell
      headline={
        <span>
          Crea tu cuenta. <br /> Gratis y en menos de un minuto.
        </span>
      }
    >
      <RegisterForm />
    </AuthScrollShell>
  );
}