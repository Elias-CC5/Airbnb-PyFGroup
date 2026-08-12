import { api } from '@/lib/api-client';
import type { User } from '@/types';
import type { AuthResponse } from '../types/auth.types';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../schemas/auth.schemas';

export const authService = {
  login: (input: LoginInput) => api.post<AuthResponse>('/auth/login', input, { auth: false }),

  register: ({ confirmPassword: _confirmPassword, phone, ...input }: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', { ...input, phone: phone || undefined }, { auth: false }),

  refresh: () => api.post<AuthResponse>('/auth/refresh', {}, { auth: false, skipRefresh: true }),

  logout: () => api.post<{ message: string }>('/auth/logout', {}, { auth: false }),

  me: () => api.get<User>('/auth/me'),

  forgotPassword: (input: ForgotPasswordInput) =>
    api.post<{ message: string; devToken?: string }>('/auth/forgot-password', input, { auth: false }),

  resetPassword: ({ confirmPassword: _confirmPassword, ...input }: ResetPasswordInput) =>
    api.post<{ message: string }>('/auth/reset-password', input, { auth: false }),

  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>('/auth/change-password', input),
};