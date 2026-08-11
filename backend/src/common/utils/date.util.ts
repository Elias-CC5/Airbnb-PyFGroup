export const MS_PER_DAY = 86_400_000;

/** Normaliza a medianoche UTC (las fechas de reserva son "date", sin hora). */
export function toUtcDate(input: string | Date): Date {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((toUtcDate(checkOut).getTime() - toUtcDate(checkIn).getTime()) / MS_PER_DAY);
}

/** Dos rangos [aIn, aOut) y [bIn, bOut) se solapan si aIn < bOut && bIn < aOut. */
export function rangesOverlap(aIn: Date, aOut: Date, bIn: Date, bOut: Date): boolean {
  return aIn < bOut && bIn < aOut;
}

export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  for (let t = toUtcDate(start).getTime(); t < toUtcDate(end).getTime(); t += MS_PER_DAY) {
    days.push(new Date(t));
  }
  return days;
}
