'use client';

import {
  Badge,
  Button,
  ConfirmDialog,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  EmptyState,
  Input,
  Pagination,
  Select,
  Spinner,
} from '@/components/ui';
import { PROPERTY_STATUS_LABEL } from '@/constants';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { propertiesService } from '@/features/properties/services/properties.service';
import { formatPrice } from '@/lib/format';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, House, MoreVertical, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

const STATUS_TONE = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  PENDING: 'warning',
  DRAFT: 'neutral',
} as const;

export function PropertiesTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useProperties({ page, limit: 12, q: q || undefined, status: status || undefined } as never);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['properties'] });

  const changeStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => propertiesService.changeStatus(id, next),
    onSuccess: () => {
      toast.success('Estado actualizado');
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => propertiesService.toggleFeatured(id, value),
    onSuccess: () => {
      toast.success('Destacado actualizado');
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => propertiesService.remove(id),
    onSuccess: () => {
      toast.success('Alojamiento eliminado');
      setToDelete(null);
      void invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Alojamientos</h1>
          <p className="mt-1 text-sm text-ink-600">{data?.meta.total ?? 0} registrados</p>
        </div>
        <Button asChild>
          <Link href="/admin/alojamientos/nuevo">
            <Plus className="size-4" /> Nuevo alojamiento
          </Link>
        </Button>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-56 flex-1">
          <Input
            placeholder="Buscar por título o destino…"
            icon={<Search className="size-4" />}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-48"
        >
          <option value="">Todos los estados</option>
          {Object.entries(PROPERTY_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Spinner label="Cargando alojamientos…" />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<House className="size-6" />}
          title="Sin alojamientos"
          description="Crea el primero para empezar a recibir reservas."
          action={
            <Button asChild>
              <Link href="/admin/alojamientos/nuevo">Crear alojamiento</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Alojamiento</th>
                  <th className="px-5 py-3 font-medium">Ubicación</th>
                  <th className="px-5 py-3 font-medium">Precio</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Métricas</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.data.map((property) => (
                  <tr key={property.id} className="transition-colors hover:bg-ink-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                          {property.images[0] && (
                            <Image src={property.images[0].url} alt="" fill sizes="44px" className="object-cover" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5">
                            <span className="block max-w-[220px] truncate font-medium text-ink-900">
                              {property.title}
                            </span>
                            {property.isFeatured && <Star className="size-3.5 shrink-0 fill-clay-500 text-clay-500" />}
                          </span>
                          <span className="block text-xs text-ink-500">{property.category.name}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {property.location.district?.name ?? property.location.province.name},{' '}
                      {property.location.department.name}
                    </td>
                    <td className="px-5 py-3 font-medium text-ink-900">{formatPrice(property.pricePerNight)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[property.status]}>{PROPERTY_STATUS_LABEL[property.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-500">
                      ★ {property.ratingAvg.toFixed(1)} · {property.reviewsCount} reseñas
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Dropdown
                        trigger={
                          <span className="grid size-9 place-items-center rounded-full text-ink-600 hover:bg-ink-100">
                            <MoreVertical className="size-4" />
                          </span>
                        }
                      >
                        {(close) => (
                          <>
                            <Link href={`/admin/alojamientos/${property.id}`} onClick={close}>
                              <DropdownItem>
                                <Pencil className="size-4" /> Editar
                              </DropdownItem>
                            </Link>
                            <Link href={`/alojamiento/${property.slug}`} target="_blank" onClick={close}>
                              <DropdownItem>
                                <Eye className="size-4" /> Ver publicación
                              </DropdownItem>
                            </Link>
                            <DropdownSeparator />
                            <DropdownItem
                              onClick={() => {
                                changeStatus.mutate({
                                  id: property.id,
                                  next: property.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                                });
                                close();
                              }}
                            >
                              {property.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                            </DropdownItem>
                            <DropdownItem
                              onClick={() => {
                                toggleFeatured.mutate({ id: property.id, value: !property.isFeatured });
                                close();
                              }}
                            >
                              <Star className="size-4" />
                              {property.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                            </DropdownItem>
                            <DropdownSeparator />
                            <DropdownItem
                              className="text-danger-700 hover:bg-danger-50"
                              onClick={() => {
                                setToDelete({ id: property.id, title: property.title });
                                close();
                              }}
                            >
                              <Trash2 className="size-4" /> Eliminar
                            </DropdownItem>
                          </>
                        )}
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar alojamiento?"
        description={`Se eliminará "${toDelete?.title}". Las reservas históricas se conservan.`}
        confirmLabel="Eliminar"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}
