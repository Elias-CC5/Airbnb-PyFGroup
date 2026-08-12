'use client';

import { Button, Input, Label } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterInput } from '../schemas/auth.schemas';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Campos de 36 px y etiquetas pequeñas: cabe entero en la pantalla del portátil. */
const FIELD = 'h-9 text-sm';
const LABEL = 'mb-1 text-[11px]';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (values) => {
    const result = await registerUser.mutateAsync(values).catch(() => null);
    if (!result) return;
    router.push('/');
    router.refresh();
  });

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/auth/github`;
  };

  return (
    <div className="mx-auto w-full max-w-md font-sans">
      {/* Encabezado */}
      <div className="mb-4 text-center">
        <h3 className="text-2xl font-bold tracking-tight text-ink-900">
          Crea tu cuenta
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          Gratis y en menos de un minuto para gestionar tus reservas
        </p>
      </div>

      {/* Botones de Registro Social */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGoogleLogin}
          className="w-full gap-2 border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGithubLogin}
          className="w-full gap-2 border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </Button>
      </div>

      {/* Divisor */}
      <div className="relative my-3.5 flex items-center justify-center">
        <div className="w-full border-t border-neutral-200" />
        <span className="absolute bg-white px-3 text-[10px] font-medium uppercase tracking-wider text-ink-400">
          o regístrate con correo
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName" className={LABEL} required>
              Nombre
            </Label>
            <Input
              id="firstName"
              className={FIELD}
              placeholder="Ana"
              icon={<User className="size-4" />}
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>

          <div>
            <Label htmlFor="lastName" className={LABEL} required>
              Apellidos
            </Label>
            <Input
              id="lastName"
              className={FIELD}
              placeholder="Quispe"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="email" className={LABEL} required>
              Correo
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className={FIELD}
              placeholder="ana@correo.com"
              icon={<Mail className="size-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div>
            <Label htmlFor="phone" className={LABEL}>
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              className={FIELD}
              placeholder="+51 999 888 777"
              icon={<Phone className="size-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="password" className={LABEL} required>
              Contraseña
            </Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={FIELD}
              placeholder="••••••••"
              icon={<Lock className="size-4" />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="pointer-events-auto grid size-6 place-items-center rounded hover:bg-ink-100 text-neutral-400"
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className={LABEL} required>
              Confirmar
            </Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={FIELD}
              placeholder="••••••••"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="pointer-events-auto grid size-6 place-items-center rounded hover:bg-ink-100 text-neutral-400"
                >
                  {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              }
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>
        </div>

        <Button type="submit" size="sm" fullWidth loading={registerUser.isPending} className="mt-2">
          Crear mi cuenta
        </Button>

        <p className="pt-1 text-center text-[11px] text-ink-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-ink-900 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}