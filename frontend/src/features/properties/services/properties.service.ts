import { api, serverFetch } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import type { Paginated, PropertyCard, PropertyDetail } from '@/types';
import { cleanFilters, type PropertyFilters } from '../types/property-filters';

export const propertiesService = {
  search: (filters: PropertyFilters) =>
    api.get<Paginated<PropertyCard>>(ENDPOINTS.properties.root, { query: cleanFilters(filters) }),

  featured: (limit = 8) => api.get<PropertyCard[]>(ENDPOINTS.properties.featured, { query: { limit } }),

  bySlug: (slug: string) => api.get<PropertyDetail>(ENDPOINTS.properties.bySlug(slug)),

  similar: (slug: string, limit = 4) =>
    api.get<PropertyCard[]>(ENDPOINTS.properties.similar(slug), { query: { limit } }),

  /** Alojamientos del anfitrión autenticado. */
  mine: (query: Record<string, unknown> = {}) =>
    api.get<Paginated<PropertyCard>>(ENDPOINTS.properties.mine, { query }),

  create: (payload: unknown) => api.post<PropertyDetail>(ENDPOINTS.properties.root, payload),
  update: (id: string, payload: unknown) => api.patch<PropertyDetail>(ENDPOINTS.properties.byId(id), payload),
  byId: (id: string) => api.get<PropertyDetail>(ENDPOINTS.properties.byId(id)),
  changeStatus: (id: string, status: string) => api.patch(ENDPOINTS.properties.status(id, status)),
  toggleFeatured: (id: string, value: boolean) => api.patch(ENDPOINTS.properties.featuredToggle(id, value)),
  remove: (id: string) => api.delete<{ message: string }>(ENDPOINTS.properties.byId(id)),
};

/* ------------------ Variantes para Server Components ------------------ */

export const propertiesServerService = {
  search: (filters: PropertyFilters) =>
    serverFetch<Paginated<PropertyCard>>(ENDPOINTS.properties.root, cleanFilters(filters), 30),
  featured: (limit = 8) => serverFetch<PropertyCard[]>(ENDPOINTS.properties.featured, { limit }, 120),
  bySlug: (slug: string) => serverFetch<PropertyDetail>(ENDPOINTS.properties.bySlug(slug), undefined, 60),
  similar: (slug: string, limit = 4) =>
    serverFetch<PropertyCard[]>(ENDPOINTS.properties.similar(slug), { limit }, 300),
};
