import { CURRENCY_SYMBOL } from '@/constants';

const priceFormatter = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** S/ 250 — la moneda principal de la plataforma es el sol peruano. */
export function formatPrice(value: string | number, withSymbol = true): string {
  const amount = typeof value === 'string' ? Number(value) : value;
  const formatted = priceFormatter.format(Number.isFinite(amount) ? amount : 0);
  return withSymbol ? `${CURRENCY_SYMBOL} ${formatted}` : formatted;
}

export function formatDate(value: string | Date, style: 'short' | 'long' = 'short'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateRange(from: string | Date, to: string | Date): string {
  return `${formatDate(from)} — ${formatDate(to)}`;
}

export function formatMonth(value: string): string {
  const [year, month] = value.split('-');
  return new Intl.DateTimeFormat('es-PE', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
}

export function formatRating(value: number): string {
  return value > 0 ? value.toFixed(1).replace('.0', '.0') : 'Nuevo';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

export function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'W';
}

/** yyyy-MM-dd sin desfase de zona horaria. */
export function toISODate(date: Date): string {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .slice(0, 10);
}

export function nightsBetween(from: string | Date, to: string | Date): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
