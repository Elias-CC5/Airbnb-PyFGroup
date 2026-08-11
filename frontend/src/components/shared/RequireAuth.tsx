'use client';

import { Spinner } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface RequireAuthProps {
  children: ReactNode;
  /** Exige además rol de administrador. */
  admin?: boolean;
}

/**
 * Protección de rutas en cliente. La autorización real vive en el backend
 * (guards + roles); esto sólo evita mostrar pantallas sin permiso.
 */
export function RequireAuth({ children, admin }: RequireAuthProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (admin && !isAdmin) router.replace('/');
  }, [isLoading, isAuthenticated, isAdmin, admin, pathname, router]);

  if (isLoading || !isAuthenticated || (admin && !isAdmin)) {
    return <Spinner label="Verificando tu sesión…" />;
  }

  return <>{children}</>;
}
