'use client';

import { Card, CardContent, Skeleton } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import type { DashboardStats } from '@/types';
import { CalendarClock, CalendarDays, House, TrendingUp, Users } from 'lucide-react';

export function StatsCards({ stats, loading }: { stats?: DashboardStats; loading?: boolean }) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: House,
      label: 'Alojamientos',
      value: stats.properties.total,
      hint: `${stats.properties.active} activos`,
    },
    {
      icon: CalendarDays,
      label: 'Reservas',
      value: stats.reservations.total,
      hint: `${stats.reservations.confirmed} confirmadas`,
    },
    {
      icon: CalendarClock,
      label: 'Pendientes',
      value: stats.reservations.pending,
      hint: 'Requieren tu revisión',
      highlight: stats.reservations.pending > 0,
    },
    {
      icon: Users,
      label: 'Usuarios',
      value: stats.users.total,
      hint: `+${stats.users.newThisMonth} este mes`,
    },
    {
      icon: TrendingUp,
      label: 'Ingresos',
      value: formatPrice(stats.revenue.total),
      hint: `${formatPrice(stats.revenue.thisMonth)} este mes`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className={card.highlight ? 'border-warning-500/40 bg-warning-50/50' : undefined}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-500">{card.label}</span>
              <card.icon className="size-4 text-ink-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-ink-900">{card.value}</p>
            <p className="mt-0.5 text-xs text-ink-500">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
