import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { PrismaService } from '../../database/prisma.service';
import { QueryUsersDto, UpdateUserDto, UpdateUserRoleDto } from '../dto';
import { userPublicSelect } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryUsersDto) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: { ...userPublicSelect, _count: { select: { reservations: true, properties: true } } },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResponse(data, total, query.page, query.limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: userPublicSelect,
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: dto, select: userPublicSelect });
  }

  async updateRole(id: string, dto: UpdateUserRoleDto, actorId: string) {
    if (id === actorId) throw new BadRequestException('No puedes cambiar tu propio rol');
    return this.prisma.user.update({ where: { id }, data: { role: dto.role }, select: userPublicSelect });
  }

  async setActive(id: string, isActive: boolean, actorId: string) {
    if (id === actorId) throw new BadRequestException('No puedes desactivar tu propia cuenta');
    return this.prisma.user.update({ where: { id }, data: { isActive }, select: userPublicSelect });
  }

  /** Borrado lógico: conserva el histórico de reservas y reseñas. */
  async softDelete(id: string, actorId: string) {
    if (id === actorId) throw new BadRequestException('No puedes eliminar tu propia cuenta');
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.role === Role.SUPER_ADMIN) throw new BadRequestException('No se puede eliminar un super administrador');

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { message: 'Usuario eliminado' };
  }

  /** Métricas del usuario para su panel personal. */
  async stats(userId: string) {
    const [reservations, favorites, reviews] = await this.prisma.$transaction([
      this.prisma.reservation.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId } }),
      this.prisma.review.count({ where: { userId } }),
    ]);
    return { reservations, favorites, reviews };
  }
}
