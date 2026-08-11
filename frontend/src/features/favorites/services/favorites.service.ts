import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import type { Paginated, PropertyCard } from '@/types';

export const favoritesService = {
  list: (page = 1, limit = 12) =>
    api.get<Paginated<PropertyCard>>(ENDPOINTS.favorites.root, { query: { page, limit } }),
  ids: () => api.get<string[]>(ENDPOINTS.favorites.ids),
  toggle: (propertyId: string) =>
    api.post<{ isFavorite: boolean; message: string }>(ENDPOINTS.favorites.toggle(propertyId)),
};
