'use client';

import { useAuthStore } from '@/store';
import { authService } from '@/features/auth/services/auth.service';
import { tokenStore } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useAuthStore();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = params.get('token');

    if (!token) {
      setError(true);
      return;
    }

    // El token llega en la URL (redirección de Google) — lo ponemos en memoria
    // temporalmente para poder llamar a /auth/me con él antes de tener la sesión completa.
    tokenStore.set(token);

    authService
      .me()
      .then((user) => {
        setSession(user, token);
        const isStaff = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
        router.replace(isStaff ? '/admin' : '/');
      })
      .catch(() => {
        tokenStore.clear();
        setError(true);
      });
  }, [params, router, setSession]);

  if (error) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-semibold text-ink-900">No pudimos iniciar tu sesión</p>
        <p className="text-sm text-ink-500">Intenta de nuevo desde la pantalla de acceso.</p>
        <a href="/login" className="mt-2 text-sm font-medium text-clay-700 hover:underline">
          Volver al login
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm text-ink-500">Iniciando sesión…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}