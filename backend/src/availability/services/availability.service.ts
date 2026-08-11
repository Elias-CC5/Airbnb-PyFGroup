import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { nightsBetween, toUtcDate } from '../../common/utils';
import { PrismaService } from '../../database/prisma.service';
import { CheckAvailabilityDto, CreateBlockDto } from '../dto';

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  subtotal: number;
  total: number;
  currency: string;
}

/**
 * Fuente única de verdad sobre disponibilidad.
 * Tanto el buscador público como la creación de reservas pasan por aquí.
 */
@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /** Valida el rango de fechas y devuelve las fechas normalizadas a UTC. */
  parseRange(checkIn: string | Date, checkOut: string | Date) {
    const start = toUtcDate(checkIn);
    const end = toUtcDate(checkOut);
    const today = toUtcDate(new Date());

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }
    if (start < today) throw new BadRequestException('La fecha de entrada no puede ser pasada');
    if (end <= start) throw new BadRequestException('La fecha de salida debe ser posterior a la de entrada');
    if (nightsBetween(start, end) > 365) throw new BadRequestException('La estadía máxima es de 365 noches');

    return { start, end, nights: nightsBetween(start, end) };
  }

  /** ¿Está libre el alojamiento en ese rango? (excluye opcionalmente una reserva). */
  async isFree(propertyId: string, start: Date, end: Date, ignoreReservationId?: string): Promise<boolean> {
    const [overlappingReservations, overlappingBlocks] = await this.prisma.$transaction([
      this.prisma.reservation.count({
        where: {
          propertyId,
          id: ignoreReservationId ? { not: ignoreReservationId } : undefined,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
          checkIn: { lt: end },
          checkOut: { gt: start },
        },
      }),
      this.prisma.availabilityBlock.count({
        where: { propertyId, startDate: { lt: end }, endDate: { gt: start } },
      }),
    ]);

    return overlappingReservations === 0 && overlappingBlocks === 0;
  }

  /** Comprobación completa con cálculo de precio, lista para mostrar en el card de reserva. */
  async check(propertyId: string, dto: CheckAvailabilityDto): Promise<AvailabilityResult> {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      select: {
        pricePerNight: true,
        cleaningFee: true,
        currency: true,
        maxGuests: true,
        minNights: true,
        maxNights: true,
        status: true,
      },
    });
    if (!property) throw new NotFoundException('Alojamiento no encontrado');

    const { start, end, nights } = this.parseRange(dto.checkIn, dto.checkOut);
    const pricePerNight = Number(property.pricePerNight);
    const cleaningFee = Number(property.cleaningFee);
    const subtotal = pricePerNight * nights;

    const base = {
      nights,
      pricePerNight,
      cleaningFee,
      subtotal,
      total: subtotal + cleaningFee,
      currency: property.currency,
    };

    if (property.status !== 'ACTIVE') {
      return { ...base, available: false, reason: 'El alojamiento no está disponible actualmente' };
    }
    if (dto.guests && dto.guests > property.maxGuests) {
      return { ...base, available: false, reason: `La capacidad máxima es de ${property.maxGuests} huéspedes` };
    }
    if (nights < property.minNights) {
      return { ...base, available: false, reason: `La estadía mínima es de ${property.minNights} noche(s)` };
    }
    if (property.maxNights && nights > property.maxNights) {
      return { ...base, available: false, reason: `La estadía máxima es de ${property.maxNights} noches` };
    }
    if (!(await this.isFree(propertyId, start, end))) {
      return { ...base, available: false, reason: 'Esas fechas ya están ocupadas' };
    }

    return { ...base, available: true };
  }

  /** Fechas ocupadas de los próximos N meses, para deshabilitarlas en el calendario. */
  async occupiedDates(propertyId: string, months = 12) {
    const from = toUtcDate(new Date());
    const to = new Date(from);
    to.setUTCMonth(to.getUTCMonth() + months);

    const [reservations, blocks] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where: {
          propertyId,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
          checkOut: { gt: from },
          checkIn: { lt: to },
        },
        select: { checkIn: true, checkOut: true },
      }),
      this.prisma.availabilityBlock.findMany({
        where: { propertyId, endDate: { gt: from }, startDate: { lt: to } },
        select: { startDate: true, endDate: true },
      }),
    ]);

    return [
      ...reservations.map((r) => ({ from: r.checkIn, to: r.checkOut, type: 'reservation' as const })),
      ...blocks.map((b) => ({ from: b.startDate, to: b.endDate, type: 'block' as const })),
    ];
  }

  async createBlock(propertyId: string, dto: CreateBlockDto) {
    const { start, end } = this.parseRange(dto.startDate, dto.endDate);
    if (!(await this.isFree(propertyId, start, end))) {
      throw new BadRequestException('Ese rango se cruza con una reserva o bloqueo existente');
    }
    return this.prisma.availabilityBlock.create({
      data: { propertyId, startDate: start, endDate: end, reason: dto.reason },
    });
  }

  async removeBlock(id: string) {
    await this.prisma.availabilityBlock.delete({ where: { id } });
    return { message: 'Bloqueo eliminado' };
  }

  listBlocks(propertyId: string) {
    return this.prisma.availabilityBlock.findMany({
      where: { propertyId },
      orderBy: { startDate: 'asc' },
    });
  }
}
