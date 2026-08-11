import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PropertyStatus, ReservationStatus, Role } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AvailabilityService } from '../../availability/services/availability.service';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { PrismaService } from '../../database/prisma.service';
import { CreateReservationDto, QueryReservationsDto, UpdateReservationStatusDto } from '../dto';

const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

/** Transiciones de estado permitidas. Cualquier otra se rechaza. */
const TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
  CONFIRMED: [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED],
  CANCELLED: [],
  COMPLETED: [],
};

const reservationInclude = {
  property: {
    select: {
      id: true,
      title: true,
      slug: true,
      whatsappPhone: true,
      checkInTime: true,
      checkOutTime: true,
      images: { where: { isMain: true }, take: 1, select: { url: true, alt: true } },
      location: { select: { department: { select: { name: true } }, province: { select: { name: true } } } },
    },
  },
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  review: { select: { id: true, rating: true } },
} satisfies Prisma.ReservationInclude;

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
  ) {}

  /**
   * Crea la reserva dentro de una transacción y vuelve a comprobar la disponibilidad
   * DENTRO de ella, para evitar la condición de carrera de dos reservas simultáneas.
   */
  async create(dto: CreateReservationDto, user: AuthenticatedUser) {
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, deletedAt: null },
    });
    if (!property) throw new NotFoundException('Alojamiento no encontrado');
    if (property.status !== PropertyStatus.ACTIVE) {
      throw new BadRequestException('Este alojamiento no admite reservas por el momento');
    }

    const { start, end, nights } = this.availability.parseRange(dto.checkIn, dto.checkOut);

    if (dto.guests > property.maxGuests) {
      throw new BadRequestException(`La capacidad máxima es de ${property.maxGuests} huéspedes`);
    }
    if (nights < property.minNights) {
      throw new BadRequestException(`La estadía mínima es de ${property.minNights} noche(s)`);
    }
    if (property.maxNights && nights > property.maxNights) {
      throw new BadRequestException(`La estadía máxima es de ${property.maxNights} noches`);
    }

    const pricePerNight = Number(property.pricePerNight);
    const cleaningFee = Number(property.cleaningFee);
    const totalPrice = pricePerNight * nights + cleaningFee;

    return this.prisma.$transaction(async (tx) => {
      const conflicts = await tx.reservation.count({
        where: {
          propertyId: property.id,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
          checkIn: { lt: end },
          checkOut: { gt: start },
        },
      });
      const blocked = await tx.availabilityBlock.count({
        where: { propertyId: property.id, startDate: { lt: end }, endDate: { gt: start } },
      });

      if (conflicts > 0 || blocked > 0) {
        throw new ConflictException('Esas fechas acaban de ser ocupadas, elige otras');
      }

      return tx.reservation.create({
        data: {
          code: generateCode(),
          propertyId: property.id,
          userId: user.id,
          checkIn: start,
          checkOut: end,
          guests: dto.guests,
          nights,
          pricePerNight,
          cleaningFee,
          totalPrice,
          currency: property.currency,
          notes: dto.notes,
          status: ReservationStatus.PENDING,
        },
        include: reservationInclude,
      });
    });
  }

  /** Reservas del usuario autenticado. */
  async findMine(userId: string, query: QueryReservationsDto) {
    const where: Prisma.ReservationWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        include: reservationInclude,
        orderBy: { checkIn: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return new PaginatedResponse(data, total, query.page, query.limit);
  }

  /** Listado administrativo con filtros. */
  async findAll(query: QueryReservationsDto) {
    const where: Prisma.ReservationWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.propertyId ? { propertyId: query.propertyId } : {}),
      ...(query.from ? { checkIn: { gte: new Date(query.from) } } : {}),
      ...(query.to ? { checkOut: { lte: new Date(query.to) } } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search.toUpperCase() } },
              { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
              { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
              { user: { email: { contains: query.search, mode: 'insensitive' } } },
              { property: { title: { contains: query.search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        include: reservationInclude,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return new PaginatedResponse(data, total, query.page, query.limit);
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: reservationInclude,
    });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');

    const isStaff = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    if (!isStaff && reservation.userId !== user.id) {
      throw new ForbiddenException('No puedes ver esta reserva');
    }
    return reservation;
  }

  async updateStatus(id: string, dto: UpdateReservationStatusDto) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');

    if (!TRANSITIONS[reservation.status].includes(dto.status)) {
      throw new BadRequestException(
        `No se puede pasar de ${reservation.status} a ${dto.status}`,
      );
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === ReservationStatus.CANCELLED
          ? { cancelledAt: new Date(), cancelReason: dto.reason }
          : {}),
      },
      include: reservationInclude,
    });
  }

  /** El huésped puede cancelar mientras la reserva no haya empezado. */
  async cancelMine(id: string, user: AuthenticatedUser, reason?: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    if (reservation.userId !== user.id) throw new ForbiddenException('No puedes cancelar esta reserva');
const cancellable: ReservationStatus[] = [ReservationStatus.PENDING, ReservationStatus.CONFIRMED];
    if (!cancellable.includes(reservation.status)) {
            throw new BadRequestException('Esta reserva ya no se puede cancelar');
    }
    if (reservation.checkIn <= new Date()) {
      throw new BadRequestException('No se puede cancelar una estadía que ya comenzó');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED, cancelledAt: new Date(), cancelReason: reason },
      include: reservationInclude,
    });
  }
}
