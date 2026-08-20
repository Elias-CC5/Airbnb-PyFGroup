'use client';

import { Badge, Button, EmptyState, Pagination, Spinner } from '@/components/ui';
import { propertiesService } from '@/features/properties/services/properties.service';
import { formatPrice } from '@/lib/format';
import { useQuery } from '@tanstack/react-query';
import { House, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const ESTADO: Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
  DRAFT: { label: 'Borrador', tone: 'neutral' },
  PENDING: { label: 'En revisión', tone: 'warning' },
  PENDING_REVIEW: { label: 'En revisión', tone: 'warning' },
  ACTIVE: { label: 'Publicado', tone: 'success' },
  INACTIVE: { label: 'Pausado', tone: 'neutral' },
  PAUSED: { label: 'Pausado', tone: 'neutral' },
  REJECTED: { label: 'Rechazado', tone: 'danger' },
  ARCHIVED: { label: 'Archivado', tone: 'neutral' },
};

export function HostProperties() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'mine', page],
    queryFn: () => propertiesService.mine({ page, limit: 12 }),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Mis alojamientos</h1>
          <p className="mt-1 text-sm text-ink-600">
            {data?.meta.total ?? 0} {data?.meta.total === 1 ? 'alojamiento' : 'alojamientos'}
          </p>
        </div>
        <Button asChild>
          <Link href="/host/alojamientos/nuevo">
            <Plus className="size-4" /> Agregar alojamiento
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <Spinner label="Cargando tus alojamientos…" />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<House className="size-6" />}
          title="Todavía no publicas nada"
          description="Crea tu primer alojamiento: información, fotos y precio. Puedes guardarlo como borrador y publicarlo cuando esté listo."
          action={
            <Button asChild>
              <Link href="/host/alojamientos/nuevo">
                <Plus className="size-4" /> Crear el primero
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {data.data.map((p) => {
            const portada = p.images.find((i) => i.isMain) ?? p.images[0];
            const estado = ESTADO[p.status] ?? { label: p.status, tone: 'neutral' as const };

            return (
              <li
                key={p.id}
                className="overflow-hidden rounded-2xl border border-ink-200 bg-white transition hover:shadow-sm"
              >
                <Link href={`/host/alojamientos/${p.id}`} className="block">
                  <div className="relative aspect-[4/3] bg-ink-100">
                    {portada ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={portada.url}
                        alt={p.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-xs text-ink-400">
                        Sin fotos
                      </div>
                    )}
                    <span className="absolute left-3 top-3">
                      <Badge tone={estado.tone}>{estado.label}</Badge>
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="truncate font-medium text-ink-900">{p.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-500">
                      {p.location?.district?.name ?? p.location?.department?.name ?? '—'}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink-900">
                        {formatPrice(p.pricePerNight)}
                        <span className="text-xs font-normal text-ink-500"> /noche</span>
                      </span>
                      {p.reviewsCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-ink-600">
                          <Star className="size-3.5 fill-ink-900 text-ink-900" />
                          {p.ratingAvg.toFixed(1)} ({p.reviewsCount})
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
      )}
    </div>
  );
}
