'use client';

import { Button, Spinner } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { propertiesService } from '@/features/properties/services/properties.service';
import { queryKeys } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, House, Images, Plus, Send } from 'lucide-react';
import Link from 'next/link';
import { hostService } from '../services/host.service';

export function HostDashboard() {
  const { user } = useAuth();

  const { data: perfil } = useQuery({ queryKey: queryKeys.hosts.me, queryFn: hostService.me });

  const { data: alojamientos, isLoading } = useQuery({
    queryKey: ['properties', 'mine'],
    queryFn: propertiesService.mine,
  });

  const lista = alojamientos ?? [];
  const publicados = lista.filter((p) => p.status === 'ACTIVE').length;
  const borradores = lista.filter((p) => p.status === 'DRAFT').length;
  const sinFotos = lista.filter((p) => p.images.length === 0).length;

  if (isLoading) return <Spinner label="Cargando tu panel…" />;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          Hola, {user?.firstName}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          {perfil?.profile?.hostSince
            ? `Anfitrión desde ${new Date(perfil.profile.hostSince).getFullYear()}`
            : 'Bienvenido a tu panel de anfitrión'}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metrica valor={lista.length} etiqueta="Alojamientos" />
        <Metrica valor={publicados} etiqueta="Publicados" />
        <Metrica valor={borradores} etiqueta="Borradores" />
        <Metrica valor={sinFotos} etiqueta="Sin fotos" destacar={sinFotos > 0} />
      </div>

      {/* --------------------------- qué hacer ahora --------------------------- */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-500">
          Siguientes pasos
        </h2>

        {lista.length === 0 && (
          <Tarea
            icono={<House className="size-5" />}
            titulo="Crea tu primer alojamiento"
            texto="Información, fotos y precio. Puedes guardarlo como borrador y publicarlo después."
            accion={{ href: '/host/alojamientos/nuevo', label: 'Empezar' }}
          />
        )}

        {sinFotos > 0 && (
          <Tarea
            icono={<Images className="size-5" />}
            titulo={`${sinFotos} ${sinFotos === 1 ? 'alojamiento no tiene' : 'alojamientos no tienen'} fotos`}
            texto="Sin fotos casi nadie reserva. Entra a la ficha y súbelas desde el panel derecho."
            accion={{ href: '/host/alojamientos', label: 'Ver alojamientos' }}
          />
        )}

        {borradores > 0 && (
          <Tarea
            icono={<Send className="size-5" />}
            titulo={`${borradores} en borrador`}
            texto="Cuando estén completos, cámbialos a publicado desde la ficha."
            accion={{ href: '/host/alojamientos', label: 'Revisar' }}
          />
        )}

        {lista.length > 0 && sinFotos === 0 && borradores === 0 && (
          <Tarea
            icono={<Plus className="size-5" />}
            titulo="Todo en orden"
            texto="Tus alojamientos están publicados y con fotos. Puedes agregar otro cuando quieras."
            accion={{ href: '/host/alojamientos/nuevo', label: 'Agregar otro' }}
          />
        )}
      </section>
    </div>
  );
}

function Metrica({
  valor,
  etiqueta,
  destacar,
}: {
  valor: number;
  etiqueta: string;
  destacar?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
      <p className={`text-3xl font-bold ${destacar ? 'text-danger-700' : 'text-ink-900'}`}>
        {valor}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-500">{etiqueta}</p>
    </div>
  );
}

function Tarea({
  icono,
  titulo,
  texto,
  accion,
}: {
  icono: React.ReactNode;
  titulo: string;
  texto: string;
  accion: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-700">
        {icono}
      </span>
      <div className="min-w-48 flex-1">
        <p className="font-medium text-ink-900">{titulo}</p>
        <p className="mt-0.5 text-sm text-ink-600">{texto}</p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={accion.href}>
          {accion.label} <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
