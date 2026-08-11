'use client';

import { Button, EmptyState, ErrorState, Pagination, Spinner, Tabs } from '@/components/ui';
import type { ReservationStatus } from '@/types';
import { CalendarX } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useMyReservations } from '../hooks/useReservations';
import { ReservationCard } from './ReservationCard';

type Filter = 'ALL' | ReservationStatus;

const TABS: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

export function MyReservationsView() {
  const [tab, setTab] = useState<Filter>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useMyReservations({
    page,
    status: tab === 'ALL' ? undefined : tab,
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Mis reservas</h1>
        <p className="mt-1 text-sm text-ink-600">Consulta el estado de tus estadías y deja tu reseña.</p>
      </header>

      <Tabs
        value={tab}
        onChange={(value) => {
          setTab(value);
          setPage(1);
        }}
        items={TABS}
        className="mb-7 max-w-xl"
      />

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <Spinner label="Cargando tus reservas…" />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<CalendarX className="size-6" />}
          title="Aún no tienes reservas aquí"
          description="Cuando reserves un alojamiento aparecerá en esta sección."
          action={
            <Button asChild>
              <Link href="/alojamientos">Buscar alojamientos</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.data.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-10" />
          )}
        </>
      )}
    </div>
  );
}
