'use client';

import { Button, Input, Label } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas/auth.schemas';
import { authService } from '../services/auth.service';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const mutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (data) => {
      toast.success(data.message);
      router.push('/login');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5" noValidate>
      <input type="hidden" {...register('token')} />

      <div>
        <Label htmlFor="password" required>Nueva contraseña</Label>
        <Input
          id="password"
          type="password"
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
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <Button type="submit" size="lg" fullWidth loading={mutation.isPending}>
        Guardar nueva contraseña
      </Button>
    </form>
  );
}
