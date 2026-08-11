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
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email" required>Correo electrónico</Label>
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
          <Label htmlFor="password" className="mb-0" required>Contraseña</Label>
          <Link href="/recuperar-password" className="text-xs font-medium text-clay-700 hover:underline">
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

      <Button type="submit" size="lg" fullWidth loading={login.isPending}>
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-ink-600">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/registro" className="font-medium text-clay-700 hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
