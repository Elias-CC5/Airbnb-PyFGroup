import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PropertyStatus, Role } from '@prisma/client';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { CacheService } from '../../common/services/cache.service';
import { toUtcDate, uniqueSlug } from '../../common/utils';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionsService } from '../../hosts/services/subscriptions.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CreatePropertyDto, PropertySort, SearchPropertyDto, UpdatePropertyDto } from '../dto';
import { propertyCardSelect, propertyDetailInclude } from '../interfaces/property.interface';
import { ViewsCounterService } from './views-counter.service';

/**
 * Prefijo común de todo lo que cachea este servicio. Sirve para tirar el bloque
 * entero de una vez cuando cambia cualquier ficha: es más burdo que invalidar
 * clave por clave, pero también imposible de equivocar, y el catálogo se toca
 * pocas veces al día.
 */
const CACHE = 'properties:';

/** Los destacados cambian cuando el equipo los mueve, no solos. */
const TTL_DESTACADOS = 5 * 60 * 1000;

/** Los parecidos dependen de categoría y departamento: aún más estables. */
const TTL_PARECIDOS = 10 * 60 * 1000;

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptions: SubscriptionsService,
    private readonly cache: CacheService,
    private readonly views: ViewsCounterService,
  ) {}

  // ------------------------------ lectura ------------------------------
  /**
   * Buscador público. Los filtros se acumulan en un único `where` de Prisma
   * y la disponibilidad se resuelve con una subconsulta NOT sobre reservas y bloqueos.
   */
  async search(query: SearchPropertyDto, currentUser?: AuthenticatedUser | null) {
    const isAdmin = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN;

    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      status: isAdmin && query.status ? query.status : PropertyStatus.ACTIVE,
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { shortDescription: { contains: query.q, mode: 'insensitive' } },
              { location: { department: { name: { contains: query.q, mode: 'insensitive' } } } },
              { location: { province: { name: { contains: query.q, mode: 'insensitive' } } } },
            ],
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.guests ? { maxGuests: { gte: query.guests } } : {}),
      ...(query.bedrooms ? { bedrooms: { gte: query.bedrooms } } : {}),
      ...(query.bathrooms ? { bathrooms: { gte: query.bathrooms } } : {}),
      ...(query.minPrice || query.maxPrice
        ? {
            pricePerNight: {
              ...(query.minPrice ? { gte: query.minPrice } : {}),
              ...(query.maxPrice ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
      ...(query.department || query.departmentId || query.provinceId || query.districtId
        ? {
            location: {
              ...(query.department ? { department: { slug: query.department } } : {}),
              ...(query.departmentId ? { departmentId: query.departmentId } : {}),
              ...(query.provinceId ? { provinceId: query.provinceId } : {}),
              ...(query.districtId ? { districtId: query.districtId } : {}),
            },
          }
        : {}),
      // Debe tener TODAS las amenidades solicitadas (AND, no OR).
      ...(query.amenities?.length
        ? { AND: query.amenities.map((id) => ({ amenities: { some: { amenityId: id } } })) }
        : {}),
      ...this.availabilityFilter(query.checkIn, query.checkOut),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        select: propertyCardSelect,
        orderBy: this.orderBy(query.sort),
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.property.count({ where }),
    ]);

    const withFavorites = await this.attachFavorites(data, currentUser?.id);
    return new PaginatedResponse(withFavorites, total, query.page, query.limit);
  }

  /**
   * Destacados de la portada. Es la consulta más repetida del sitio —la ve todo
   * el que entra— y la que menos cambia, así que es la que más gana con caché.
   */
  async findFeatured(limit = 8) {
    return this.cache.wrap(`${CACHE}featured:${limit}`, TTL_DESTACADOS, () =>
      this.prisma.property.findMany({
        where: { status: PropertyStatus.ACTIVE, deletedAt: null, isFeatured: true },
        select: propertyCardSelect,
        orderBy: [{ ratingAvg: 'desc' }, { createdAt: 'desc' }],
        take: limit,
      }),
    );
  }

  async findBySlug(slug: string, currentUser?: AuthenticatedUser | null) {
    const property = await this.prisma.property.findFirst({
      where: { slug, deletedAt: null },
      include: propertyDetailInclude,
    });
    if (!property) throw new NotFoundException('Alojamiento no encontrado');

    const isStaff = currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN;
    if (property.status !== PropertyStatus.ACTIVE && !isStaff && property.ownerId !== currentUser?.id) {
      throw new NotFoundException('Alojamiento no encontrado');
    }

    // Contador de vistas: se suma en memoria y se vuelca en tandas. Antes cada
    // visita disparaba su propio UPDATE contra la misma fila.
    this.views.registrar(property.id);

    const isFavorite = currentUser
      ? Boolean(
          await this.prisma.favorite.findUnique({
            where: { userId_propertyId: { userId: currentUser.id, propertyId: property.id } },
          }),
        )
      : false;

    return { ...property, isFavorite };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: propertyDetailInclude,
    });
    if (!property) throw new NotFoundException('Alojamiento no encontrado');
    return property;
  }

  /** Alojamientos parecidos: misma categoría o mismo departamento. */
  async findSimilar(slug: string, limit = 4) {
    return this.cache.wrap(`${CACHE}similar:${slug}:${limit}`, TTL_PARECIDOS, () =>
      this.buscarParecidos(slug, limit),
    );
  }

  private async buscarParecidos(slug: string, limit: number) {
    const property = await this.prisma.property.findUnique({
      where: { slug },
      select: { id: true, categoryId: true, location: { select: { departmentId: true } } },
    });
    if (!property) return [];

    return this.prisma.property.findMany({
      where: {
        id: { not: property.id },
        status: PropertyStatus.ACTIVE,
        deletedAt: null,
        OR: [
          { categoryId: property.categoryId },
          { location: { departmentId: property.location.departmentId } },
        ],
      },
      select: propertyCardSelect,
      orderBy: { ratingAvg: 'desc' },
      take: limit,
    });
  }

  // ------------------------------ escritura ------------------------------
  async create(dto: CreatePropertyDto, user: AuthenticatedUser) {
    // Plan gratuito: un solo alojamiento publicable. Se comprueba antes de
    // escribir nada, para no dejar una ficha huérfana si el límite falla.
    await this.subscriptions.assertCanPublish(user);

    const { location, amenityIds, ...data } = dto;

    // Destacar es decisión editorial y, desde que existen los planes, un
    // beneficio de pago. Si el campo llegara del cuerpo de la petición,
    // cualquier anfitrión se autodestacaría con una llamada a la API,
    // saltándose el plan. Ocultarlo en el formulario no basta.
    if (!this.isStaff(user)) delete data.isFeatured;

    const slug = await uniqueSlug(dto.title, async (s) =>
      Boolean(await this.prisma.property.findUnique({ where: { slug: s } })),
    );

    // La ubicación se crea antes: Prisma no permite mezclar FK escalares
    // (ownerId, categoryId) con escrituras anidadas de una relación propia.
    const creada = await this.prisma.$transaction(async (tx) => {
      const createdLocation = await tx.location.create({ data: location });

      return tx.property.create({
        data: {
          ...data,
          slug,
          // Un anfitrión no publica por su cuenta: su ficha nace en borrador y
          // sale al público sólo cuando un administrador la aprueba.
          status: this.isStaff(user) ? data.status : PropertyStatus.DRAFT,
          ownerId: user.id,
          locationId: createdLocation.id,
          ...(amenityIds?.length
            ? { amenities: { create: amenityIds.map((amenityId) => ({ amenityId })) } }
            : {}),
        },
        include: propertyDetailInclude,
      });
    });

    this.cache.invalidar(CACHE);
    return creada;
  }

  async update(id: string, dto: UpdatePropertyDto, user: AuthenticatedUser) {
    const property = await this.ensureCanManage(id, user);
    const { location, amenityIds, title, ...data } = dto;

    // Mismo motivo que en create(): el destacado sólo lo mueve el equipo.
    if (!this.isStaff(user)) delete data.isFeatured;

    const slug =
      title && title !== property.title
        ? await uniqueSlug(title, async (s) => {
            const found = await this.prisma.property.findUnique({ where: { slug: s } });
            return Boolean(found && found.id !== id);
          })
        : undefined;

    const actualizada = await this.prisma.$transaction(async (tx) => {
      if (amenityIds) {
        await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
        if (amenityIds.length) {
          await tx.propertyAmenity.createMany({
            data: amenityIds.map((amenityId) => ({ propertyId: id, amenityId })),
          });
        }
      }

      // La ubicación se actualiza por separado, por el mismo motivo que en create().
      if (location) {
        await tx.location.update({ where: { id: property.locationId }, data: location });
      }

      return tx.property.update({
        where: { id },
        data: {
          ...data,
          ...(title ? { title } : {}),
          ...(slug ? { slug } : {}),
        },
        include: propertyDetailInclude,
      });
    });

    this.cache.invalidar(CACHE);
    return actualizada;
  }

  /**
   * Cambios de estado permitidos.
   *
   * El administrador puede llevar una ficha a cualquier estado. El anfitrión
   * no: puede enviarla a revisión, pausar la suya ya aprobada, reactivarla o
   * archivarla, pero NUNCA publicarla él mismo. Si esto se dejara abierto,
   * cualquier anfitrión saltaría la revisión con una sola llamada a la API.
   */
  private static readonly TRANSICIONES_ANFITRION: Partial<Record<PropertyStatus, PropertyStatus[]>> = {
    DRAFT: [PropertyStatus.PENDING_REVIEW, PropertyStatus.ARCHIVED],
    REJECTED: [PropertyStatus.PENDING_REVIEW, PropertyStatus.ARCHIVED],
    PENDING_REVIEW: [PropertyStatus.DRAFT, PropertyStatus.ARCHIVED],
    ACTIVE: [PropertyStatus.PAUSED, PropertyStatus.ARCHIVED],
    PAUSED: [PropertyStatus.ACTIVE, PropertyStatus.ARCHIVED],
  };

  async changeStatus(id: string, status: PropertyStatus, user: AuthenticatedUser) {
    const property = await this.ensureCanManage(id, user);

    if (!this.isStaff(user)) {
      const permitidos = PropertiesService.TRANSICIONES_ANFITRION[property.status] ?? [];
      if (!permitidos.includes(status)) {
        throw new ForbiddenException(
          status === PropertyStatus.ACTIVE
            ? 'Envía el alojamiento a revisión: la publicación la aprueba un administrador'
            : `No puedes pasar de ${property.status} a ${status}`,
        );
      }
    }

    // Sacar una ficha del cajón también consume cupo; pausarla o archivarla, no.
    if (status === PropertyStatus.ACTIVE || status === PropertyStatus.PENDING_REVIEW) {
      await this.subscriptions.assertCanPublish(user, id);
    }

    // Al salir al público, la ficha hereda el destacado del plan de su dueño.
    // Si no hay plan, se apaga: evita que una ficha destacada por un plan
    // anterior se quede así para siempre.
    const destacar =
      status === PropertyStatus.ACTIVE
        ? await this.subscriptions.tienePlanVigente(property.ownerId)
        : undefined;

    const cambiada = await this.prisma.property.update({
      where: { id },
      data: { status, ...(destacar === undefined || destacar === null ? {} : { isFeatured: destacar }) },
    });

    this.cache.invalidar(CACHE);
    return cambiada;
  }

  /** Alojamientos del anfitrión que hace la petición. */
  findMine(user: AuthenticatedUser) {
    return this.prisma.property.findMany({
      where: { ownerId: user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        ...propertyCardSelect,
        _count: { select: { reservations: true, reviews: true } },
      },
    });
  }

  async toggleFeatured(id: string, isFeatured: boolean, user: AuthenticatedUser) {
    await this.ensureCanManage(id, user);
    const ficha = await this.prisma.property.update({ where: { id }, data: { isFeatured } });

    this.cache.invalidar(CACHE);
    return ficha;
  }

  /** Borrado lógico: las reservas históricas siguen siendo válidas. */
  async remove(id: string, user: AuthenticatedUser) {
    await this.ensureCanManage(id, user);
    await this.prisma.property.update({
      where: { id },
      data: { deletedAt: new Date(), status: PropertyStatus.ARCHIVED },
    });

    this.cache.invalidar(CACHE);
    return { message: 'Alojamiento eliminado' };
  }

  /** Recalcula rating y número de reseñas. Lo invoca el módulo de reseñas. */
  async refreshRating(propertyId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { propertyId, isVisible: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await this.prisma.property.update({
      where: { id: propertyId },
      data: {
        ratingAvg: Number((agg._avg.rating ?? 0).toFixed(2)),
        reviewsCount: agg._count._all,
      },
    });

    // Los destacados se ordenan por nota, así que una reseña nueva puede
    // cambiar el orden de la portada.
    this.cache.invalidar(CACHE);
  }

  // ------------------------------ helpers ------------------------------
  private isStaff(user: AuthenticatedUser): boolean {
    return user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
  }

  async ensureCanManage(id: string, user: AuthenticatedUser) {
    const property = await this.prisma.property.findFirst({ where: { id, deletedAt: null } });
    if (!property) throw new NotFoundException('Alojamiento no encontrado');

    if (!this.isStaff(user) && property.ownerId !== user.id) {
      throw new ForbiddenException('No puedes administrar este alojamiento');
    }
    return property;
  }

  private orderBy(sort?: PropertySort): Prisma.PropertyOrderByWithRelationInput[] {
    switch (sort) {
      case PropertySort.PRICE_ASC:
        return [{ pricePerNight: 'asc' }];
      case PropertySort.PRICE_DESC:
        return [{ pricePerNight: 'desc' }];
      case PropertySort.RATING:
        return [{ ratingAvg: 'desc' }, { reviewsCount: 'desc' }];
      case PropertySort.POPULAR:
        return [{ views: 'desc' }];
      default:
        return [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }
  }

  /** Excluye alojamientos con reservas o bloqueos que se crucen con el rango pedido. */
  private availabilityFilter(checkIn?: string, checkOut?: string): Prisma.PropertyWhereInput {
    if (!checkIn || !checkOut) return {};
    const start = toUtcDate(checkIn);
    const end = toUtcDate(checkOut);
    if (end <= start) return {};

    return {
      reservations: {
        none: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkIn: { lt: end },
          checkOut: { gt: start },
        },
      },
      blocks: { none: { startDate: { lt: end }, endDate: { gt: start } } },
    };
  }

  /** Marca `isFavorite` en el listado sin hacer N+1 consultas. */
  private async attachFavorites<T extends { id: string }>(items: T[], userId?: string) {
    if (!userId || items.length === 0) return items.map((i) => ({ ...i, isFavorite: false }));

    const favorites = await this.prisma.favorite.findMany({
      where: { userId, propertyId: { in: items.map((i) => i.id) } },
      select: { propertyId: true },
    });
    const set = new Set(favorites.map((f) => f.propertyId));
    return items.map((i) => ({ ...i, isFavorite: set.has(i.id) }));
  }
}
