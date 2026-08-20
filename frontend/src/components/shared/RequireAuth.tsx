'use client';

import { Spinner } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface RequireAuthProps {
  children: ReactNode;
  /** Exige además rol de administrador. */
  admin?: boolean;
  /** Exige rol de anfitrión o superior (HOST, ADMIN, SUPER_ADMIN). */
  host?: boolean;
}

/**
 * Protección de rutas en cliente. La autorización real vive en el backend
 * (guards + roles); esto sólo evita mostrar pantallas sin permiso.
 */
export function RequireAuth({ children, admin, host }: RequireAuthProps) {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // La jerarquía real vive en el backend; esto sólo evita pintar pantallas
  // que el servidor va a rechazar igual.
  const isHost = isAdmin || user?.role === 'HOST';

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (admin && !isAdmin) router.replace('/');
    else if (host && !isHost) router.replace('/conviertete-en-anfitrion');
  }, [isLoading, isAuthenticated, isAdmin, isHost, admin, host, pathname, router]);

  if (isLoading || !isAuthenticated || (admin && !isAdmin) || (host && !isHost)) {
    return <Spinner label="Verificando tu sesión…" />;
  }

  return <>{children}</>;
}
