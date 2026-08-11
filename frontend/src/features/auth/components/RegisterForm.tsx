'use client';

import { Button, Input, Label } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterInput } from '../schemas/auth.schemas';

/** Campos de 36 px y etiquetas pequeñas: cabe entero en la pantalla del portátil. */
const FIELD = 'h-9 text-sm';
const LABEL = 'mb-1 text-[11px]';

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
            type="password"
            autoComplete="new-password"
            className={FIELD}
            placeholder="••••••••"
            icon={<Lock className="size-4" />}
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
            type="password"
            autoComplete="new-password"
            className={FIELD}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </div>

      <Button type="submit" size="sm" fullWidth loading={registerUser.isPending} className="mt-1">
        Crear mi cuenta
      </Button>

      <p className="text-center text-[11px] text-ink-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-ink-900 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}