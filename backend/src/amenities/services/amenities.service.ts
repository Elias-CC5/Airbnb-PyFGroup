import { Injectable, NotFoundException } from '@nestjs/common';
import { uniqueSlug } from '../../common/utils';
import { PrismaService } from '../../database/prisma.service';
import { CreateAmenityDto, UpdateAmenityDto } from '../dto';

@Injectable()
export class AmenitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(onlyActive = true) {
    return this.prisma.amenity.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });
  }

  /** Agrupadas para pintar el bloque "¿Qué ofrece este lugar?". */
  async findGrouped() {
    const amenities = await this.findAll();
    const groups = new Map<string, typeof amenities>();
    for (const a of amenities) {
      const key = a.group ?? 'Otros';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(a);
    }
    return [...groups.entries()].map(([group, items]) => ({ group, items }));
  }

  async create(dto: CreateAmenityDto) {
    const slug = await uniqueSlug(dto.name, async (s) =>
      Boolean(await this.prisma.amenity.findUnique({ where: { slug: s } })),
    );
    return this.prisma.amenity.create({ data: { ...dto, slug } });
  }

  async update(id: number, dto: UpdateAmenityDto) {
    await this.ensureExists(id);
    return this.prisma.amenity.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.amenity.delete({ where: { id } });
    return { message: 'Amenidad eliminada' };
  }

  private async ensureExists(id: number) {
    const found = await this.prisma.amenity.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Amenidad no encontrada');
    return found;
  }
}
