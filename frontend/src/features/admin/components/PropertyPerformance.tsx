'use client';

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { usePropertyPerformance } from '@/features/admin/hooks/useDashboard';
import { formatPrice } from '@/lib/format';
import { useMemo, useState } from 'react';

type Metric = 'revenue' | 'nights' | 'reservations';

const METRICS: Array<{ key: Metric; label: string }> = [
  { key: 'revenue', label: 'Ingresos' },
  { key: 'nights', label: 'Noches' },
  { key: 'reservations', label: 'Estadías' },
];

/** Últimos años con movimiento, del más reciente al más antiguo. */
function yearOptions(): number[] {
  const current = new Date().getUTCFullYear();
  return [current, current - 1, current - 2];
}

/**
 * Rendimiento por alojamiento — el cuadro "por departamento" que el equipo
 * llevaba a mano en el Excel de ocupación, calculado desde la base de datos.
 */
export function PropertyPerformance() {
  const [year, setYear] = useState(() => new Date().getUTCFullYear());
  const [metric, setMetric] = useState<Metric>('revenue');

  const { data, isLoading } = usePropertyPerformance(`${year}-01-01`, `${year + 1}-01-01`);

  const rows = useMemo(
    () => [...(data ?? [])].sort((a, b) => b[metric] - a[metric]),
    [data, metric],
  );

  const max = rows.length ? rows[0][metric] : 0;

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          revenue: acc.revenue + r.revenue,
          nights: acc.nights + r.nights,
          reservations: acc.reservations + r.reservations,
        }),
        { revenue: 0, nights: 0, reservations: 0 },
      ),
    [rows],
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Rendimiento por alojamiento</CardTitle>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-ink-200 p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetric(m.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  metric === m.key ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
            aria-label="Año"
          >
            {yearOptions().map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full rounded-xl" />
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">
            No hay estadías registradas en {year}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wider text-ink-500">
                  <th className="pb-3 pr-4 font-medium">Alojamiento</th>
                  <th className="pb-3 pr-4 text-right font-medium">Ingresos</th>
                  <th className="pb-3 pr-4 text-right font-medium">Noches</th>
                  <th className="pb-3 pr-4 text-right font-medium">Estadías</th>
                  <th className="pb-3 pr-4 text-right font-medium">S//noche</th>
                  <th className="w-[22%] pb-3 font-medium">{METRICS.find((m) => m.key === metric)?.label}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-ink-100 last:border-0">
                    <td className="py-3 pr-4 text-ink-800">{row.title}</td>
                    <td className="py-3 pr-4 text-right font-medium tabular-nums text-ink-900">
                      {formatPrice(row.revenue)}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-ink-700">{row.nights}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-ink-700">
                      {row.reservations}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums text-ink-500">
                      {row.avgPerNight > 0 ? formatPrice(row.avgPerNight) : '—'}
                    </td>
                    <td className="py-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full bg-ink-900 transition-all"
                          style={{ width: `${max > 0 ? (row[metric] / max) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink-900 font-semibold text-ink-900">
                  <td className="pt-3 pr-4">{rows.length} alojamientos</td>
                  <td className="pt-3 pr-4 text-right tabular-nums">{formatPrice(totals.revenue)}</td>
                  <td className="pt-3 pr-4 text-right tabular-nums">{totals.nights}</td>
                  <td className="pt-3 pr-4 text-right tabular-nums">{totals.reservations}</td>
                  <td className="pt-3 pr-4 text-right tabular-nums text-ink-500">
                    {totals.nights > 0 ? formatPrice(totals.revenue / totals.nights) : '—'}
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
