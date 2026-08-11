'use client';

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';
import { formatMonth, formatPrice } from '@/lib/format';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyPoint } from '../services/admin.service';

interface Props {
  data?: MonthlyPoint[];
  loading?: boolean;
  metric?: 'reservations' | 'revenue';
  title?: string;
}

export function ReservationsChart({ data, loading, metric = 'reservations', title }: Props) {
  const isRevenue = metric === 'revenue';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? (isRevenue ? 'Ingresos por mes' : 'Reservas por mes')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data ?? []} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id={`grad-${metric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-clay-500)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-clay-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ink-200)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-ink-400)"
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-ink-400)" width={56} />
                <Tooltip
                  formatter={(value: number) => (isRevenue ? formatPrice(value) : `${value} reservas`)}
                  labelFormatter={formatMonth}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--color-ink-200)',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="var(--color-clay-600)"
                  strokeWidth={2}
                  fill={`url(#grad-${metric})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
