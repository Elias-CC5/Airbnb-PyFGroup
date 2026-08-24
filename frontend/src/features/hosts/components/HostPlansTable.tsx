'use client';

import { Badge, EmptyState, Pagination, Spinner } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { queryKeys } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { hostsAdminService, type HostSummary } from '../services/hosts.service';

/** Días que faltan para una fecha. Negativo = ya pasó. */
function diasHasta(fecha: string) {
  const MS_DIA = 86_400_000;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(0, 0, 0, 0);
  return Math.round((fin.getTime() - hoy.getTime()) / MS_DIA);
}

/**
 * Estado del plan tal como lo ve el administrador.
 *
 * Se calcula con la fecha, no con el campo `status` de la suscripción: el
 * vencimiento en el backend es perezoso —se aplica cuando el anfitrión entra o
 * cuando corre el repaso diario—, así que una suscripción puede seguir marcada
 * como ACTIVE con la fecha ya pasada. Aquí interesa la verdad del calendario.
 */
function estadoDelPlan(host: HostSummary) {
  const suscripcion = host.subscriptions?.[0];
  if (!suscripcion?.endsAt) return { tipo: 'gratuito' as const };

  const dias = diasHasta(suscripcion.endsAt);
  if (dias < 0) return { tipo: 'vencido' as const, dias, suscripcion };
  if (dias <= 7) return { tipo: 'porVencer' as const, dias, suscripcion };
  return { tipo: 'vigente' as const, dias, suscripcion };
}

export function HostPlansTable() {
  const [page, setPage] = useState(1);
  const filtros = { page, limit: 20 };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.hosts(filtros),
    queryFn: () => hostsAdminService.hosts(filtros),
  });

  if (isLoading) return <Spinner label="Cargando anfitriones…" />;

  if (!data?.items.length) {
    return (
      <EmptyState
        icon={<CalendarClock className="size-6" />}
        title="Todavía no hay anfitriones"
        description="Cuando apruebes una solicitud, el anfitrión y su plan aparecerán aquí."
      />
    );
  }

  const porVencer = data.items.filter((h) => {
    const estado = estadoDelPlan(h);
    return estado.tipo === 'porVencer' || estado.tipo === 'vencido';
  }).length;

  return (
    <div className="space-y-4">
      {porVencer > 0 && (
        <p className="text-sm text-ink-600">
          {porVencer === 1
            ? '1 anfitrión con el plan vencido o a punto de vencer.'
            : `${porVencer} anfitriones con el plan vencido o a punto de vencer.`}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Anfitrión</th>
                <th className="px-5 py-3 text-right font-medium">Alojamientos</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Vence</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.items.map((host) => {
                const estado = estadoDelPlan(host);

                return (
                  <tr key={host.id} className="transition-colors hover:bg-ink-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">
                        {host.displayName || `${host.user.firstName} ${host.user.lastName}`}
                      </p>
                      <p className="text-xs text-ink-500">{host.user.email}</p>
                    </td>

                    <td className="px-5 py-3 text-right tabular-nums text-ink-700">
                      {host.propertiesCount}
                    </td>

                    <td className="px-5 py-3 text-ink-700">
                      {estado.tipo === 'gratuito' ? (
                        <span className="text-ink-400">Plan gratuito</span>
                      ) : (
                        <>
                          {estado.suscripcion.plan.name}
                          {estado.suscripcion.startsAt && (
                            <span className="block text-xs text-ink-400">
                              desde {formatDate(estado.suscripcion.startsAt)}
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    <td className="px-5 py-3 text-ink-700">
                      {estado.tipo === 'gratuito' ? (
                        <span className="text-ink-400">—</span>
                      ) : (
                        <>
                          {formatDate(estado.suscripcion.endsAt!)}
                          <span className="block text-xs text-ink-400">
                            {estado.dias === 0
                              ? 'hoy'
                              : estado.dias > 0
                                ? `en ${estado.dias} ${estado.dias === 1 ? 'día' : 'días'}`
                                : `hace ${Math.abs(estado.dias)} ${
                                    Math.abs(estado.dias) === 1 ? 'día' : 'días'
                                  }`}
                          </span>
                        </>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      {estado.tipo === 'gratuito' && <Badge>Gratuito</Badge>}
                      {estado.tipo === 'vigente' && <Badge tone="success">Al día</Badge>}
                      {estado.tipo === 'porVencer' && <Badge tone="warning">Por vencer</Badge>}
                      {estado.tipo === 'vencido' && <Badge tone="danger">Vencido</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {data.pages > 1 && (
        <Pagination page={data.page} totalPages={data.pages} onChange={setPage} />
      )}
    </div>
  );
}
