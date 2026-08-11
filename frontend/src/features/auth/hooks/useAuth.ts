'use client';

import { useAuthStore } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import type { LoginInput, RegisterInput } from '../schemas/auth.schemas';

/** Acceso al estado de sesión + acciones de login/registro/logout. */
export function useAuth() {
  const router = useRouter();
  const { user, status, setSession, clear, isAdmin } = useAuthStore();

  const login = useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: ({ user: loggedUser, tokens }) => {
      setSession(loggedUser, tokens.accessToken);
      toast.success(`Hola, ${loggedUser.firstName}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const register = useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: ({ user: newUser, tokens }) => {
      setSession(newUser, tokens.accessToken);
      toast.success('¡Cuenta creada! Bienvenido a Airbnb PyFGroup');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clear();
      router.push('/');
      router.refresh();
      toast.success('Sesión cerrada');
    },
  });

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'idle' || status === 'loading',
    isAdmin: isAdmin(),
    login,
    register,
    logout,
  };
}
