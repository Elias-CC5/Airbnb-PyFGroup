'use client';

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import { useMemo } from 'react';

export interface MonthlyPoint {
  month: string; // 'yyyy-MM'
  reservations: number;
  revenue: number;
}

interface MonthlyBreakdownProps {
  data?: MonthlyPoint[];
  loading?: boolean;
}

/** 'agosto 2026' a partir de 'yyyy-MM', sin desfase de zona horaria. */
function monthLabel(value: string): string {
  const [year, month] = value.split('-').map(Number);
  const label = new Intl.DateTimeFormat('es-PE', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Desglose mes a mes de los mismos datos que alimentan los gráficos.
 * Los gráficos muestran la tendencia; esta tabla da la cifra exacta de cada
 * mes, que es lo que se compara contra el Excel de ocupación.
 */
export function MonthlyBreakdown({ data, loading }: MonthlyBreakdownProps) {
  const thisMonth = currentMonthKey();

  // Del más reciente al más antiguo: lo que se suele querer mirar primero.
  const rows = useMemo(() => [...(data ?? [])].sort((a, b) => b.month.localeCompare(a.month)), [data]);

  const maxRevenue = useMemo(
    () => rows.reduce((max, row) => Math.max(max, row.revenue), 0),
    [rows],
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          reservations: acc.reservations + row.reservations,
          revenue: acc.revenue + row.revenue,
        }),
        { reservations: 0, revenue: 0 },
      ),
    [rows],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle por mes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">Todavía no hay estadías registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wider text-ink-500">
                  <th className="pb-3 pr-4 font-medium">Mes</th>
                  <th className="pb-3 pr-4 text-right font-medium">Reservas</th>
                  <th className="pb-3 pr-4 text-right font-medium">Ingresos</th>
                  <th className="pb-3 pr-4 text-right font-medium">Ticket prom.</th>
                  <th className="w-[28%] pb-3 font-medium">Peso</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isCurrent = row.month === thisMonth;
                  const share = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0;
                  const ticket = row.reservations > 0 ? row.revenue / row.reservations : 0;

                  return (
                    <tr
                      key={row.month}
                      className={`border-b border-ink-100 last:border-0 ${
                        isCurrent ? 'bg-ink-50' : ''
                      }`}
                    >
                      <td className="py-3 pr-4">
                        <span className={isCurrent ? 'font-semibold text-ink-900' : 'text-ink-800'}>
                          {monthLabel(row.month)}
                        </span>
                        {isCurrent && (
                          <span className="ml-2 rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                            Actual
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-ink-700">
                        {row.reservations}
                      </td>
                      <td className="py-3 pr-4 text-right font-medium tabular-nums text-ink-900">
                        {formatPrice(row.revenue)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-ink-500">
                        {ticket > 0 ? formatPrice(ticket) : '—'}
                      </td>
                      <td className="py-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                          <div
                            className="h-full rounded-full bg-ink-900 transition-all"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink-900 text-sm font-semibold text-ink-900">
                  <td className="pt-3 pr-4">Total del período</td>
                  <td className="pt-3 pr-4 text-right tabular-nums">{totals.reservations}</td>
                  <td className="pt-3 pr-4 text-right tabular-nums">{formatPrice(totals.revenue)}</td>
                  <td className="pt-3 pr-4 text-right tabular-nums text-ink-500">
                    {totals.reservations > 0
                      ? formatPrice(totals.revenue / totals.reservations)
                      : '—'}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
