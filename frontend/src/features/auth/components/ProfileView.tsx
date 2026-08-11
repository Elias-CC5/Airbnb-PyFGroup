'use client';

import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Spinner } from '@/components/ui';
import { ROLE_LABEL } from '@/constants';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/format';
import { queryKeys } from '@/services/api';
import { useAuthStore } from '@/store';
import type { User } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Heart, Star } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { authService } from '../services/auth.service';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Ingresa tu nombre'),
  lastName: z.string().min(2, 'Ingresa tus apellidos'),
  phone: z.string().max(30).optional().or(z.literal('')),
});
type ProfileInput = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  newPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe incluir mayúscula, minúscula y número'),
});
type PasswordInput = z.infer<typeof passwordSchema>;

export function ProfileView() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const { data: user, isLoading } = useQuery({ queryKey: ['auth', 'me'], queryFn: authService.me });
  const { data: stats } = useQuery({
    queryKey: queryKeys.users.stats,
    queryFn: () => api.get<{ reservations: number; favorites: number; reviews: number }>('/users/me/stats'),
  });

  const profileForm = useForm<ProfileInput>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      profileForm.reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateProfile = useMutation({
    mutationFn: (values: ProfileInput) => api.patch<User>('/users/me', values),
    onSuccess: (updated) => {
      setUser(updated);
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Perfil actualizado');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const changePassword = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (data) => {
      toast.success(data.message);
      passwordForm.reset();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading || !user) return <Spinner label="Cargando tu perfil…" />;

  const cards = [
    { icon: CalendarCheck, label: 'Reservas', value: stats?.reservations ?? 0 },
    { icon: Heart, label: 'Favoritos', value: stats?.favorites ?? 0 },
    { icon: Star, label: 'Reseñas', value: stats?.reviews ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center gap-5">
        <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="lg" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            {user.firstName} {user.lastName}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <span>{user.email}</span>
            <Badge tone="clay">{ROLE_LABEL[user.role]}</Badge>
            {user.createdAt && <span>Miembro desde {formatDate(user.createdAt, 'long')}</span>}
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="grid size-11 place-items-center rounded-2xl bg-clay-50 text-clay-700">
                <card.icon className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-semibold text-ink-900">{card.value}</p>
                <p className="text-xs text-ink-500">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" error={profileForm.formState.errors.firstName?.message} {...profileForm.register('firstName')} />
            </div>
            <div>
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" error={profileForm.formState.errors.lastName?.message} {...profileForm.register('lastName')} />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="+51 999 888 777" {...profileForm.register('phone')} />
            </div>
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={updateProfile.isPending}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((v) => changePassword.mutate(v))}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="outline" loading={changePassword.isPending}>
                Actualizar contraseña
              </Button>
              <p className="mt-2 text-xs text-ink-500">Se cerrarán todas tus sesiones activas.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
