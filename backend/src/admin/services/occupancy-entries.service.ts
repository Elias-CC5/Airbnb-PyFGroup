import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingChannel, ReservationStatus, Role } from '@prisma/client';
import { PasswordService } from '../../auth/services/password.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateOccupancyEntryDto, UpdateOccupancyEntryDto } from '../dto/occupancy-entry.dto';

/** Estados que bloquean una fecha; las canceladas liberan el calendario. */
const BLOCKING = [
  ReservationStatus.PENDING,
  ReservationStatus.CONFIRMED,
  ReservationStatus.COMPLETED,
];

/**
 * Alta, edición y borrado de estadías directamente sobre el calendario del
 * panel. A diferencia de las reservas públicas, aquí el administrador escribe
 * el nombre del huésped a mano: son reservas que llegaron por teléfono, Airbnb
 * u otra plataforma.
 */
@Injectable()
export class OccupancyEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async create(dto: CreateOccupancyEntryDto) {
    const { start, end, nights } = this.parseRange(dto.checkIn, dto.checkOut);
    await this.ensureFree(dto.propertyId, start, end);

    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, deletedAt: null },
      select: { id: true, currency: true },
    });
    if (!property) throw new NotFoundException('Alojamiento no encontrado');

    const guestAccount = await this.ensureGuestAccount();

    return this.prisma.reservation.create({
      data: {
        code: await this.uniqueCode(start),
        propertyId: property.id,
        userId: guestAccount.id,
        checkIn: start,
        checkOut: end,
        nights,
        guests: dto.guests ?? 1,
        pricePerNight: dto.pricePerNight,
        cleaningFee: 0,
        totalPrice: dto.pricePerNight * nights,
        currency: property.currency,
        status: dto.status ?? ReservationStatus.CONFIRMED,
        channel: dto.channel ?? BookingChannel.DIRECT,
        guestName: dto.guestName,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdateOccupancyEntryDto) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');

    const propertyId = dto.propertyId ?? reservation.propertyId;
    const checkIn = dto.checkIn ?? reservation.checkIn.toISOString().slice(0, 10);
    const checkOut = dto.checkOut ?? reservation.checkOut.toISOString().slice(0, 10);
    const { start, end, nights } = this.parseRange(checkIn, checkOut);

    const movedOrResized =
      propertyId !== reservation.propertyId ||
      start.getTime() !== reservation.checkIn.getTime() ||
      end.getTime() !== reservation.checkOut.getTime();

    if (movedOrResized) await this.ensureFree(propertyId, start, end, id);

    const pricePerNight = dto.pricePerNight ?? Number(reservation.pricePerNight);

    return this.prisma.reservation.update({
      where: { id },
      data: {
        propertyId,
        checkIn: start,
        checkOut: end,
        nights,
        pricePerNight,
        totalPrice: pricePerNight * nights + Number(reservation.cleaningFee),
        ...(dto.guestName !== undefined ? { guestName: dto.guestName } : {}),
        ...(dto.channel !== undefined ? { channel: dto.channel } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.guests !== undefined ? { guests: dto.guests } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
  }

  async remove(id: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');

    await this.prisma.reservation.delete({ where: { id } });
    return { message: 'Reserva eliminada' };
  }

  // ------------------------------- helpers -------------------------------
  /** Fechas en UTC para que no se desplacen según la zona del navegador. */
  private parseRange(checkIn: string, checkOut: string) {
    const start = new Date(`${checkIn.slice(0, 10)}T00:00:00Z`);
    const end = new Date(`${checkOut.slice(0, 10)}T00:00:00Z`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }
    if (end <= start) {
      throw new BadRequestException('La salida debe ser posterior a la entrada');
    }

    const nights = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    return { start, end, nights };
  }

  /** Dos rangos se solapan si aIn < bOut && bIn < aOut. */
  private async ensureFree(propertyId: string, start: Date, end: Date, excludeId?: string) {
    const conflict = await this.prisma.reservation.findFirst({
      where: {
        propertyId,
        status: { in: BLOCKING },
        checkIn: { lt: end },
        checkOut: { gt: start },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { guestName: true, checkIn: true, checkOut: true },
    });

    if (conflict) {
      const from = conflict.checkIn.toISOString().slice(0, 10);
      const to = conflict.checkOut.toISOString().slice(0, 10);
      throw new ConflictException(
        `Esas fechas ya están ocupadas por ${conflict.guestName ?? 'otra reserva'} (${from} → ${to})`,
      );
    }
  }

  /** Código corto y legible: M + YYMMDD + 3 aleatorios, dentro del VarChar(20). */
  private async uniqueCode(start: Date): Promise<string> {
    const stamp = start.toISOString().slice(2, 10).replace(/-/g, '');

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const random = Math.random().toString(36).slice(2, 5).toUpperCase();
      const code = `M${stamp}${random}`;
      const taken = await this.prisma.reservation.findUnique({ where: { code } });
      if (!taken) return code;
    }
    throw new ConflictException('No se pudo generar un código único, inténtalo de nuevo');
  }

  /** Cuenta técnica compartida por las estadías cargadas a mano. */
  private async ensureGuestAccount() {
    const email = 'huespedes.importados@pyfgroupsac.com';
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    return this.prisma.user.create({
      data: {
        email,
        password: await this.passwords.hash(`manual-${Date.now()}-${Math.random()}`),
        firstName: 'Huésped',
        lastName: 'Externo',
        role: Role.USER,
        isActive: false,
      },
    });
  }
}
