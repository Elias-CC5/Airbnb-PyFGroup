import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../database/prisma.service';
import { propertyCardSelect } from '../../properties/interfaces/property.interface';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMine(userId: string, pagination: PaginationDto) {
    const where = { userId, property: { deletedAt: null } };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.favorite.findMany({
        where,
        include: { property: { select: propertyCardSelect } },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.favorite.count({ where }),
    ]);

    const data = rows.map((r) => ({ ...r.property, isFavorite: true, savedAt: r.createdAt }));
    return new PaginatedResponse(data, total, pagination.page, pagination.limit);
  }

  /** Un único endpoint para guardar/quitar: el cliente sólo necesita el resultado. */
  async toggle(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
      select: { id: true },
    });
    if (!property) throw new NotFoundException('Alojamiento no encontrado');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { userId_propertyId: { userId, propertyId } } });
      return { isFavorite: false, message: 'Eliminado de favoritos' };
    }

    await this.prisma.favorite.create({ data: { userId, propertyId } });
    return { isFavorite: true, message: 'Guardado en favoritos' };
  }

  async ids(userId: string) {
    const rows = await this.prisma.favorite.findMany({ where: { userId }, select: { propertyId: true } });
    return rows.map((r) => r.propertyId);
  }

  async count(userId: string) {
    return { count: await this.prisma.favorite.count({ where: { userId } }) };
  }
}
