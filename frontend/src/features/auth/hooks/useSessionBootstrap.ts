'use client';

import { useAuthStore } from '@/store';
import { useEffect } from 'react';
import { authService } from '../services/auth.service';


let bootstrapped = false;

export function useSessionBootstrap() {
  const { setSession, setStatus, clear } = useAuthStore();

  useEffect(() => {
    if (bootstrapped) return;
    bootstrapped = true;

    setStatus('loading');

    authService
      .refresh()
      .then(({ user, tokens }) => setSession(user, tokens.accessToken))
      .catch(() => clear());
  }, [setSession, setStatus, clear]);
}