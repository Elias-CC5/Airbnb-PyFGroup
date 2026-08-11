import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Departamentos con el número de alojamientos publicados (para la sección "Destinos"). */
  async departments() {
    const departments = await this.prisma.department.findMany({ orderBy: { name: 'asc' } });
    const counts = await this.prisma.location.groupBy({
      by: ['departmentId'],
      _count: { _all: true },
      where: { property: { status: 'ACTIVE', deletedAt: null } },
    });
    const map = new Map(counts.map((c) => [c.departmentId, c._count._all]));
    return departments.map((d) => ({ ...d, propertiesCount: map.get(d.id) ?? 0 }));
  }

  provinces(departmentId: number) {
    return this.prisma.province.findMany({
      where: { departmentId },
      orderBy: { name: 'asc' },
    });
  }

  districts(provinceId: number) {
    return this.prisma.district.findMany({
      where: { provinceId },
      orderBy: { name: 'asc' },
    });
  }

  async departmentBySlug(slug: string) {
    const department = await this.prisma.department.findUnique({ where: { slug } });
    if (!department) throw new NotFoundException('Departamento no encontrado');
    return department;
  }

  /** Destinos más populares por número de alojamientos. */
  async topDestinations(limit = 6) {
    const all = await this.departments();
    return all.sort((a, b) => b.propertiesCount - a.propertiesCount).slice(0, limit);
  }
}
