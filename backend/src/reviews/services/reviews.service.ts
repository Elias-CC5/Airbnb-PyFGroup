import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationStatus, Role } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../database/prisma.service';
import { PropertiesService } from '../../properties/services/properties.service';
import { CreateReviewDto, UpdateReviewDto } from '../dto';

const reviewInclude = {
  user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
};

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly properties: PropertiesService,
  ) {}

  /** Sólo puede reseñar quien completó una estadía y aún no ha reseñado esa reserva. */
  async create(dto: CreateReviewDto, user: AuthenticatedUser) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      include: { review: true },
    });

    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    if (reservation.userId !== user.id) throw new ForbiddenException('Esta reserva no es tuya');
    if (reservation.status !== ReservationStatus.COMPLETED) {
      throw new BadRequestException('Sólo puedes reseñar estadías completadas');
    }
    if (reservation.review) throw new BadRequestException('Ya dejaste una reseña para esta reserva');

    const review = await this.prisma.review.create({
      data: {
        propertyId: reservation.propertyId,
        userId: user.id,
        reservationId: reservation.id,
        rating: dto.rating,
        comment: dto.comment.trim(),
      },
      include: reviewInclude,
    });

    await this.properties.refreshRating(reservation.propertyId);
    return review;
  }

  async findByProperty(propertyId: string, pagination: PaginationDto) {
    const where = { propertyId, isVisible: true };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return new PaginatedResponse(data, total, pagination.page, pagination.limit);
  }

  /** Distribución de estrellas (5★: 12, 4★: 3, ...) para la ficha del alojamiento. */
  async summary(propertyId: string) {
    const grouped = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { propertyId, isVisible: true },
      _count: { _all: true },
    });

    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: grouped.find((g) => g.rating === stars)?._count._all ?? 0,
    }));
    const total = distribution.reduce((acc, d) => acc + d.count, 0);
    const average = total
      ? distribution.reduce((acc, d) => acc + d.stars * d.count, 0) / total
      : 0;

    return { total, average: Number(average.toFixed(2)), distribution };
  }

  findMine(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { property: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateReviewDto, user: AuthenticatedUser) {
    const review = await this.ensureOwnership(id, user);
    const updated = await this.prisma.review.update({ where: { id }, data: dto, include: reviewInclude });
    await this.properties.refreshRating(review.propertyId);
    return updated;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const review = await this.ensureOwnership(id, user);
    await this.prisma.review.delete({ where: { id } });
    await this.properties.refreshRating(review.propertyId);
    return { message: 'Reseña eliminada' };
  }

  /** Moderación: ocultar una reseña sin borrarla. */
  async setVisibility(id: string, isVisible: boolean) {
    const review = await this.prisma.review.update({ where: { id }, data: { isVisible } });
    await this.properties.refreshRating(review.propertyId);
    return review;
  }

  private async ensureOwnership(id: string, user: AuthenticatedUser) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Reseña no encontrada');

    const isStaff = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    if (!isStaff && review.userId !== user.id) throw new ForbiddenException('No puedes editar esta reseña');
    return review;
  }
}
