'use client';

import { Button, Input, Label } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterInput } from '../schemas/auth.schemas';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

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

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName" required>Nombre</Label>
          <Input
            id="firstName"
            placeholder="Ana"
            icon={<User className="size-4" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
        </div>
        <div>
          <Label htmlFor="lastName" required>Apellidos</Label>
          <Input id="lastName" placeholder="Quispe" error={errors.lastName?.message} {...register('lastName')} />
        </div>
      </div>

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
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+51 999 888 777"
          icon={<Phone className="size-4" />}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password" required>Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            icon={<Lock className="size-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword" required>Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-ink-500">
        Al crear tu cuenta aceptas nuestros términos de servicio y la política de privacidad.
      </p>

      <Button type="submit" size="lg" fullWidth loading={registerUser.isPending}>
        Crear mi cuenta
      </Button>

      <p className="text-center text-sm text-ink-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-clay-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
