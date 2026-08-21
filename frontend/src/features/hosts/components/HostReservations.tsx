'use client';

import { Badge, EmptyState, Pagination, Spinner } from '@/components/ui';
import { RESERVATION_STATUS_LABEL } from '@/constants';
import { formatDate, formatPrice } from '@/lib/format';
import { queryKeys } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { CalendarX, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { hostService } from '../services/host.service';

const TONO: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
};

const FILTROS = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

/** Sólo dígitos: es lo que espera wa.me. */
const soloDigitos = (telefono: string) => telefono.replace(/\D/g, '');

export function HostReservations() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const filtros = { page, limit: 15, ...(status ? { status } : {}) };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.hosts.reservations(filtros),
    queryFn: () => hostService.reservations(filtros),
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Reservas</h1>
        <p className="mt-1 text-sm text-ink-600">
          {data?.meta.total ?? 0} en tus alojamientos
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              status === f.value
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 text-ink-600 hover:bg-ink-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner label="Cargando reservas…" />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<CalendarX className="size-6" />}
          title="Sin reservas todavía"
          description="Cuando alguien reserve uno de tus alojamientos, aparecerá aquí con sus fechas y su contacto."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Huésped</th>
                  <th className="px-5 py-3 font-medium">Alojamiento</th>
                  <th className="px-5 py-3 font-medium">Fechas</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.data.map((r) => {
                  const nombre =
                    r.guestName ?? `${r.user?.firstName ?? ''} ${r.user?.lastName ?? ''}`.trim();
                  const telefono = r.user?.phone;

                  return (
                    <tr key={r.id} className="transition-colors hover:bg-ink-50/60">
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink-900">{nombre || 'Sin nombre'}</p>
                        <p className="text-xs text-ink-500">{r.code}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-700">{r.property?.title ?? '—'}</td>
                      <td className="px-5 py-3 text-ink-600">
                        {formatDate(r.checkIn)} → {formatDate(r.checkOut)}
                        <span className="block text-xs text-ink-400">
                          {r.nights} {r.nights === 1 ? 'noche' : 'noches'} · {r.guests}{' '}
                          {r.guests === 1 ? 'huésped' : 'huéspedes'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums text-ink-900">
                        {formatPrice(r.totalPrice)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={TONO[r.status] ?? 'neutral'}>
                          {RESERVATION_STATUS_LABEL[r.status] ?? r.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {telefono && r.status !== 'CANCELLED' && (
                          <a
                            href={`https://wa.me/${soloDigitos(telefono)}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Escribir a ${nombre} por WhatsApp`}
                            className="grid size-9 place-items-center rounded-full text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
                          >
                            <MessageCircle className="size-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
