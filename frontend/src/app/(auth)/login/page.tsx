import { AuthScrollShell } from '@/features/auth/components/AuthScrollShell';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { buildMetadata } from '@/lib/seo';
import { ArrowDown } from 'lucide-react';

export const metadata = buildMetadata({ title: 'Iniciar sesión', path: '/login', noIndex: true });

export default function LoginPage() {
  return (
    <AuthScrollShell
      headline={
        <div className="flex flex-col items-center font-sans">
          {/* Indicador Minimalista centrado arriba */}
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-500 shadow-sm">
            <ArrowDown className="size-3.5 text-neutral-400 animate-bounce" />
            <span>Desliza abajo para ingresar</span>
          </div>

          {/* Título limpio y centrado */}
          <h1 className="text-center font-bold text-neutral-900 leading-tight">
            Tus reservas, <br />
            en un solo lugar. <br />
            Entra y continúa.
          </h1>
        </div>
      }
    >
      <LoginForm />
    </AuthScrollShell>
  );
}