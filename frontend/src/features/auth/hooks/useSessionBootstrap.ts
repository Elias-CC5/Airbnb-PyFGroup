'use client';

import { useAuthStore } from '@/store';
import { useEffect } from 'react';
import { authService } from '../services/auth.service';

/**
 * Al cargar la app intenta recuperar la sesión con el refresh token (cookie HttpOnly).
 * Así el usuario sigue logueado tras recargar sin exponer el token en localStorage.
 */
export function useSessionBootstrap() {
  const { setSession, setStatus, clear, status } = useAuthStore();

  useEffect(() => {
    if (status !== 'idle') return;
    let cancelled = false;

    setStatus('loading');
    authService
      .refresh()
      .then(({ user, tokens }) => {
        if (!cancelled) setSession(user, tokens.accessToken);
      })
      .catch(() => {
        if (!cancelled) clear();
      });

    return () => {
      cancelled = true;
    };
  }, [status, setSession, setStatus, clear]);
}
