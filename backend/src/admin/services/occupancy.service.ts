import { BadRequestException, Injectable } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

/** Una noche ocupada dentro de la cuadrícula. */
export interface OccupancyNight {
  date: string;
  reservationId: string;
  propertyId: string;
  code: string;
  guest: string;
  channel: string;
  status: ReservationStatus;
  pricePerNight: number;
  nights: number;
  /** Rango completo de la estadía, para editarla o moverla desde el panel. */
  checkIn: string;
  checkOut: string;
  isCheckIn: boolean;
  isCheckOut: boolean;
}

export interface OccupancyRow {
  propertyId: string;
  title: string;
  slug: string;
  nights: OccupancyNight[];
}

export interface OccupancyCalendar {
  month: string;
  days: string[];
  rows: OccupancyRow[];
  totals: Record<string, number>;
}

/**
 * Calendario de ocupación estilo hoja de cálculo: una fila por alojamiento y
 * una columna por día del mes. Se construye a partir de las reservas reales.
 */
@Injectable()
export class OccupancyService {
  constructor(private readonly prisma: PrismaService) {}

  /** `month` en formato YYYY-MM. Por defecto, el mes actual. */
  async calendar(month?: string): Promise<OccupancyCalendar> {
    const { start, end, label } = this.parseMonth(month);

    const [properties, reservations] = await Promise.all([
      // Incluye borradores: el panel debe ver también lo que aún no está publicado.
      this.prisma.property.findMany({
        where: { deletedAt: null },
        select: { id: true, title: true, slug: true },
        orderBy: { title: 'asc' },
      }),
      this.prisma.reservation.findMany({
        where: {
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED] },
          checkIn: { lt: end },
          checkOut: { gt: start },
        },
        select: {
          id: true,
          code: true,
          propertyId: true,
          checkIn: true,
          checkOut: true,
          nights: true,
          status: true,
          channel: true,
          guestName: true,
          pricePerNight: true,
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    const days = this.daysBetween(start, end);
    const byProperty = new Map<string, OccupancyNight[]>();

    for (const reservation of reservations) {
      const guest =
        reservation.guestName ??
        `${reservation.user.firstName} ${reservation.user.lastName.charAt(0)}.`;

      // Una entrada por noche ocupada; el check-out no ocupa noche.
      for (const date of this.daysBetween(reservation.checkIn, reservation.checkOut)) {
        if (date < days[0] || date > days[days.length - 1]) continue;

        const list = byProperty.get(reservation.propertyId) ?? [];
        list.push({
          date,
          reservationId: reservation.id,
          propertyId: reservation.propertyId,
          code: reservation.code,
          guest,
          channel: reservation.channel,
          status: reservation.status,
          pricePerNight: Number(reservation.pricePerNight),
          nights: reservation.nights,
          checkIn: this.toKey(reservation.checkIn),
          checkOut: this.toKey(reservation.checkOut),
          isCheckIn: date === this.toKey(reservation.checkIn),
          isCheckOut: date === this.previousDay(reservation.checkOut),
        });
        byProperty.set(reservation.propertyId, list);
      }
    }

    const rows: OccupancyRow[] = properties.map((property) => ({
      propertyId: property.id,
      title: property.title,
      slug: property.slug,
      nights: byProperty.get(property.id) ?? [],
    }));

    // Ingreso previsto por día, para la fila de totales.
    const totals: Record<string, number> = {};
    for (const day of days) totals[day] = 0;
    for (const row of rows) {
      for (const night of row.nights) totals[night.date] += night.pricePerNight;
    }

    return { month: label, days, rows, totals };
  }

  // ------------------------------ helpers ------------------------------
  /** Devuelve el rango [inicio, fin) del mes en UTC para evitar saltos de zona. */
  private parseMonth(month?: string) {
    const now = new Date();
    const fallback = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const label = month ?? fallback;

    if (!/^\d{4}-\d{2}$/.test(label)) {
      throw new BadRequestException('El mes debe tener el formato YYYY-MM');
    }

    const [year, monthNumber] = label.split('-').map(Number);
    if (monthNumber < 1 || monthNumber > 12) {
      throw new BadRequestException('Mes fuera de rango');
    }

    return {
      label,
      start: new Date(Date.UTC(year, monthNumber - 1, 1)),
      end: new Date(Date.UTC(year, monthNumber, 1)),
    };
  }

  private toKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  /** Días en [start, end), en formato YYYY-MM-DD. */
  private daysBetween(start: Date, end: Date): string[] {
    const days: string[] = [];
    const cursor = new Date(start);
    while (cursor < end) {
      days.push(this.toKey(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }

  private previousDay(date: Date): string {
    const previous = new Date(date);
    previous.setUTCDate(previous.getUTCDate() - 1);
    return this.toKey(previous);
  }
}
