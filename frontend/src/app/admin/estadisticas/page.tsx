'use client';

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { MonthlyBreakdown } from '@/features/admin/components/MonthlyBreakdown';
import { PropertyPerformance } from '@/features/admin/components/PropertyPerformance';
import { ReservationsChart } from '@/features/admin/components/ReservationsChart';
import { StatsCards } from '@/features/admin/components/StatsCards';
import { useDashboardStats, useReservationsSeries, useUsersSeries } from '@/features/admin/hooks/useDashboard';
import { formatMonth } from '@/lib/format';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdminStatsPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: series, isLoading: seriesLoading } = useReservationsSeries(12);
  const { data: users, isLoading: usersLoading } = useUsersSeries(12);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Estadísticas</h1>
        <p className="mt-1 text-sm text-ink-600">Evolución de los últimos 12 meses.</p>
      </header>

      <StatsCards stats={stats} loading={isLoading} />

      <div className="grid gap-5 xl:grid-cols-2">
        <ReservationsChart data={series} loading={seriesLoading} metric="reservations" />
        <ReservationsChart data={series} loading={seriesLoading} metric="revenue" />
      </div>

      {/* Cifra exacta de cada mes: es lo que se compara contra el Excel. */}
      <MonthlyBreakdown data={series} loading={seriesLoading} />

      <PropertyPerformance />

      <Card>
        <CardHeader>
          <CardTitle>Usuarios registrados por mes</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={users ?? []} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink-200)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--color-ink-400)"
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-ink-400)" width={40} />
                  <Tooltip
                    labelFormatter={formatMonth}
                    formatter={(value: number) => [`${value} usuarios`, '']}
                    contentStyle={{ borderRadius: 12, border: '1px solid var(--color-ink-200)', fontSize: 13 }}
                  />
                  <Bar dataKey="total" fill="var(--color-ink-900)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
