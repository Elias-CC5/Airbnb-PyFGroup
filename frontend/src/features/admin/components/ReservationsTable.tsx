'use client';

import {
  Badge,
  EmptyState,
  Input,
  Pagination,
  Select,
  Spinner,
  Tabs,
} from '@/components/ui';
import { RESERVATION_STATUS_LABEL } from '@/constants';
import { useAdminReservations, useUpdateReservationStatus } from '@/features/reservations/hooks/useReservations';
import { formatDate, formatPrice } from '@/lib/format';
import type { ReservationStatus } from '@/types';
import { CalendarX, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Filter = 'ALL' | ReservationStatus;

const TABS: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

const TONES = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'neutral',
} as const;

/** Transiciones permitidas (espejo de la regla del backend). */
const NEXT_STATES: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  CANCELLED: [],
  COMPLETED: [],
};

export function ReservationsTable() {
  const [tab, setTab] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminReservations({
    page,
    limit: 12,
    status: tab === 'ALL' ? undefined : tab,
    search: search || undefined,
  });

  const updateStatus = useUpdateReservationStatus();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Reservas</h1>
        <p className="mt-1 text-sm text-ink-600">{data?.meta.total ?? 0} reservas registradas</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          value={tab}
          onChange={(value) => {
            setTab(value);
            setPage(1);
          }}
          items={TABS}
          className="max-w-xl"
        />
        <div className="min-w-56 flex-1">
          <Input
            placeholder="Buscar por código, huésped o alojamiento…"
            icon={<Search className="size-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Cargando reservas…" />
      ) : !data?.data.length ? (
        <EmptyState icon={<CalendarX className="size-6" />} title="Sin reservas" description="Todavía no hay reservas con estos filtros." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Código</th>
                  <th className="px-5 py-3 font-medium">Huésped</th>
                  <th className="px-5 py-3 font-medium">Alojamiento</th>
                  <th className="px-5 py-3 font-medium">Fechas</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.data.map((reservation) => (
                  <tr key={reservation.id} className="transition-colors hover:bg-ink-50/60">
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">{reservation.code}</td>
                    <td className="px-5 py-3">
                      <span className="block font-medium text-ink-900">
                        {reservation.user?.firstName} {reservation.user?.lastName}
                      </span>
                      <span className="block text-xs text-ink-500">{reservation.user?.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/alojamiento/${reservation.property.slug}`}
                        target="_blank"
                        className="block max-w-[200px] truncate text-ink-800 hover:underline"
                      >
                        {reservation.property.title}
                      </Link>
                      <span className="text-xs text-ink-500">{reservation.guests} huéspedes</span>
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {formatDate(reservation.checkIn)} — {formatDate(reservation.checkOut)}
                      <span className="block text-xs text-ink-400">{reservation.nights} noches</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-ink-900">{formatPrice(reservation.totalPrice)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={TONES[reservation.status]}>{RESERVATION_STATUS_LABEL[reservation.status]}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      {NEXT_STATES[reservation.status].length > 0 ? (
                        <Select
                          aria-label="Cambiar estado"
                          className="h-9 w-40 rounded-[10px] text-xs"
                          value=""
                          onChange={(e) =>
                            e.target.value &&
                            updateStatus.mutate({ id: reservation.id, status: e.target.value as ReservationStatus })
                          }
                        >
                          <option value="">Cambiar estado…</option>
                          {NEXT_STATES[reservation.status].map((next) => (
                            <option key={next} value={next}>
                              {RESERVATION_STATUS_LABEL[next]}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="text-xs text-ink-400">Sin acciones</span>
                      )}
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
    </div>
  );
}