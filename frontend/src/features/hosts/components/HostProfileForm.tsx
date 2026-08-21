'use client';

import { Button, Input, Label, Spinner, Textarea } from '@/components/ui';
import { queryKeys } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { hostService, type HostProfileInput } from '../services/host.service';

const VACIO: HostProfileInput = {
  displayName: '',
  bio: '',
  city: '',
  country: 'Perú',
  languages: '',
  whatsapp: '',
  contactEmail: '',
};

export function HostProfileForm() {
  const queryClient = useQueryClient();
  const [valores, setValores] = useState<HostProfileInput>(VACIO);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.hosts.myProfile,
    queryFn: hostService.myProfile,
  });

  useEffect(() => {
    if (!data) return;
    setValores({
      displayName: data.displayName ?? '',
      bio: data.bio ?? '',
      city: data.city ?? '',
      country: data.country ?? 'Perú',
      languages: (data.languages ?? []).join(', '),
      whatsapp: data.whatsapp ?? '',
      contactEmail: data.contactEmail ?? '',
    });
  }, [data]);

  const set = <K extends keyof HostProfileInput>(campo: K, valor: HostProfileInput[K]) =>
    setValores((v) => ({ ...v, [campo]: valor }));

  const guardar = useMutation({
    mutationFn: () => hostService.updateMyProfile(valores),
    onSuccess: () => {
      toast.success('Perfil actualizado');
      void queryClient.invalidateQueries({ queryKey: queryKeys.hosts.myProfile });
      void queryClient.invalidateQueries({ queryKey: queryKeys.hosts.me });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <Spinner label="Cargando tu perfil…" />;

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Mi perfil</h1>
        <p className="mt-1 text-sm text-ink-600">
          Esto es lo que ven los viajeros antes de reservar contigo.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          guardar.mutate();
        }}
        className="space-y-5"
      >
        <div>
          <Label htmlFor="displayName">Nombre público</Label>
          <Input
            id="displayName"
            placeholder="Cómo quieres que te llamen"
            value={valores.displayName}
            onChange={(e) => set('displayName', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="bio">Sobre ti</Label>
          <Textarea
            id="bio"
            rows={5}
            placeholder="Hola, soy Carlos. Me encanta recibir viajeros y ayudarles a conocer los mejores lugares del Perú."
            value={valores.bio ?? ''}
            onChange={(e) => set('bio', e.target.value)}
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Dos o tres frases bastan. Cuenta algo tuyo, no del departamento.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              placeholder="Lima"
              value={valores.city ?? ''}
              onChange={(e) => set('city', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={valores.country ?? ''}
              onChange={(e) => set('country', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="languages">Idiomas</Label>
          <Input
            id="languages"
            placeholder="Español, inglés"
            value={valores.languages ?? ''}
            onChange={(e) => set('languages', e.target.value)}
          />
          <p className="mt-1.5 text-xs text-ink-500">Sepáralos con comas.</p>
        </div>

        <fieldset className="space-y-5 rounded-2xl border border-ink-200 bg-white p-5">
          <legend className="px-1 text-sm font-medium text-ink-900">Contacto</legend>
          <p className="text-xs text-ink-500">
            Sólo se comparte con huéspedes que ya reservaron contigo.
          </p>

          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              placeholder="+51 987 654 321"
              value={valores.whatsapp ?? ''}
              onChange={(e) => set('whatsapp', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Correo de contacto</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="Si prefieres uno distinto al de tu cuenta"
              value={valores.contactEmail ?? ''}
              onChange={(e) => set('contactEmail', e.target.value)}
            />
          </div>
        </fieldset>

        <Button type="submit" loading={guardar.isPending}>
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}
