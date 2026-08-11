import { SITE } from '@/constants';
import { propertiesServerService } from '@/features/properties/services/properties.service';
import type { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/alojamientos', '/destinos', '/nosotros', '/contacto', '/login', '/registro'].map(
    (path) => ({
      url: `${SITE.url}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.7,
    }),
  );

  const properties = await propertiesServerService.search({ limit: 60, page: 1 });

  const propertyRoutes =
    properties?.data.map((property) => ({
      url: `${SITE.url}/alojamiento/${property.slug}`,
      lastModified: new Date(property.createdAt),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })) ?? [];

  return [...staticRoutes, ...propertyRoutes];
}
