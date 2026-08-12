'use client';

import { Button, Input, Label } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginInput } from '../schemas/auth.schemas';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    const result = await login.mutateAsync(values).catch(() => null);
    if (!result) return;

    const redirect = params.get('redirect');
    const isStaff = result.user.role === 'ADMIN' || result.user.role === 'SUPER_ADMIN';
    router.push(redirect ?? (isStaff ? '/admin' : '/'));
    router.refresh();
  });

  return (
    <div className="mx-auto w-full max-w-md font-sans">
      {/* Encabezado e Identidad */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold tracking-tight text-ink-900">
          Bienvenido de nuevo
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          Ingresa tus credenciales para gestionar tus reservas
        </p>
      </div>

      {/* Botones de Inicio Social */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
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
          className="w-full gap-2 border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <svg className="h-4 w-4 fill-current text-neutral-900" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </Button>
      </div>

      {/* Divisor */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-neutral-200" />
        <span className="absolute bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-ink-400">
          o continúa con
        </span>
      </div>

      {/* Formulario React Hook Form */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email" required>
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            icon={<Mail className="size-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0" required>
              Contraseña
            </Label>
            <Link
              href="/recuperar-password"
              className="text-xs font-medium text-clay-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="size-4" />}
            error={errors.password?.message}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="pointer-events-auto grid size-7 place-items-center rounded-lg hover:bg-ink-100"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('password')}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={login.isPending}
          className="mt-2"
        >
          Iniciar sesión
        </Button>

        <p className="pt-2 text-center text-sm text-ink-600">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="font-medium text-clay-700 hover:underline">
            Regístrate gratis
          </Link>
        </p>
      </form>
    </div>
  );
}