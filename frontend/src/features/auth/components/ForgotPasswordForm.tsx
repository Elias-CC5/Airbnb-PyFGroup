'use client';

import { Button, Input, Label } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth.schemas';
import { authService } from '../services/auth.service';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (data) => {
      setSent(true);
      setDevToken(data.devToken ?? null);
      toast.success(data.message);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-success-50 text-success-700">
          <Mail className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Revisa tu correo</h2>
          <p className="mt-1.5 text-sm text-ink-600">
            Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
          </p>
        </div>

        {devToken && (
          <div className="rounded-xl border border-warning-500/30 bg-warning-50 p-4 text-left">
            <p className="text-xs font-semibold text-warning-700">Modo desarrollo</p>
            <p className="mt-1 text-xs break-all text-warning-700/90">
              Token: <code>{devToken}</code>
            </p>
            <Link
              href={`/recuperar-password/${devToken}`}
              className="mt-2 inline-block text-xs font-medium underline"
            >
              Continuar con el restablecimiento
            </Link>
          </div>
        )}

        <Link href="/login" className="inline-block text-sm font-medium text-clay-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email" required>Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          icon={<Mail className="size-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={mutation.isPending}>
        Enviar instrucciones
      </Button>

      <p className="text-center text-sm text-ink-600">
        <Link href="/login" className="font-medium text-clay-700 hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
