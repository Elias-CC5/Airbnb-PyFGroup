'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ReservationsChart } from '@/features/admin/components/ReservationsChart';
import { StatsCards } from '@/features/admin/components/StatsCards';
import { TopPropertiesCard } from '@/features/admin/components/TopPropertiesCard';
import { useDashboardStats, useReservationsSeries, useTopProperties } from '@/features/admin/hooks/useDashboard';
import { RESERVATION_STATUS_LABEL } from '@/constants';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: series, isLoading: seriesLoading } = useReservationsSeries(12);
  const { data: top, isLoading: topLoading } = useTopProperties(5);

  const breakdown = stats
    ? (['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((key) => ({
        label: RESERVATION_STATUS_LABEL[key],
        value: stats.reservations[key.toLowerCase() as 'pending' | 'confirmed' | 'completed' | 'cancelled'],
      }))
    : [];

  const totalBreakdown = breakdown.reduce((acc, item) => acc + item.value, 0) || 1;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-600">Resumen general de la plataforma.</p>
      </header>

      <StatsCards stats={stats} loading={isLoading} />

      <div className="grid gap-5 xl:grid-cols-2">
        <ReservationsChart data={series} loading={seriesLoading} metric="reservations" />
        <ReservationsChart data={series} loading={seriesLoading} metric="revenue" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <TopPropertiesCard data={top} loading={topLoading} />

        <Card>
          <CardHeader>
            <CardTitle>Reservas por estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-700">{item.label}</span>
                  <span className="font-medium text-ink-900">{item.value}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-clay-600 transition-[width] duration-700"
                    style={{ width: `${(item.value / totalBreakdown) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
