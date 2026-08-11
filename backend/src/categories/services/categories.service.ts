import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { uniqueSlug } from '../../common/utils';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Listado público: sólo categorías activas y con el conteo de alojamientos publicados. */
  findAllPublic() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { properties: { where: { status: 'ACTIVE', deletedAt: null } } } },
      },
    });
  }

  findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { properties: true } } },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = await uniqueSlug(dto.name, async (s) =>
      Boolean(await this.prisma.category.findUnique({ where: { slug: s } })),
    );
    return this.prisma.category.create({ data: { ...dto, slug } });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.ensureExists(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.name) {
      data.slug = await uniqueSlug(dto.name, async (s) => {
        const found = await this.prisma.category.findUnique({ where: { slug: s } });
        return Boolean(found && found.id !== id);
      });
    }
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: number) {
    const category = await this.ensureExists(id);
    const inUse = await this.prisma.property.count({ where: { categoryId: id, deletedAt: null } });
    if (inUse > 0) {
      throw new BadRequestException(
        `No se puede eliminar "${category.name}": tiene ${inUse} alojamiento(s) asociados. Desactívala en su lugar.`,
      );
    }
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Categoría eliminada' };
  }

  private async ensureExists(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }
}
