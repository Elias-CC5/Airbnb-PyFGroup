'use client';

import { tokenStore } from '@/lib/api-client';
import type { User } from '@/types';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  setSession: (user: User, accessToken: string) => void;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthState['status']) => void;
  clear: () => void;
  isAdmin: () => boolean;
}

/**
 * El access token NO se persiste en localStorage (mitiga XSS).
 * Se rehidrata al cargar la app con el refresh token en cookie HttpOnly.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  setSession: (user, accessToken) => {
    tokenStore.set(accessToken);
    set({ user, status: 'authenticated' });
  },

  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
  setStatus: (status) => set({ status }),

  clear: () => {
    tokenStore.clear();
    set({ user: null, status: 'unauthenticated' });
  },

  isAdmin: () => {
    const role = get().user?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  },
}));
