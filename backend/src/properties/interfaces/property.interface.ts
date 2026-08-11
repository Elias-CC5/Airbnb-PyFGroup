import { Prisma } from '@prisma/client';

/** Selección estándar para tarjetas de listado (payload ligero). */
export const propertyCardSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  pricePerNight: true,
  currency: true,
  maxGuests: true,
  bedrooms: true,
  bathrooms: true,
  ratingAvg: true,
  reviewsCount: true,
  isFeatured: true,
  status: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  images: {
    select: { id: true, url: true, alt: true, isMain: true, order: true },
    orderBy: [{ isMain: 'desc' }, { order: 'asc' }],
    take: 5,
  },
  location: {
    select: {
      latitude: true,
      longitude: true,
      department: { select: { id: true, name: true, slug: true } },
      province: { select: { id: true, name: true } },
      district: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.PropertySelect;

/** Detalle completo del alojamiento. */
export const propertyDetailInclude = {
  category: true,
  images: { orderBy: [{ isMain: 'desc' }, { order: 'asc' }] },
  amenities: { include: { amenity: true } },
  location: { include: { department: true, province: true, district: true } },
  owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true } },
  reviews: {
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  },
} satisfies Prisma.PropertyInclude;
