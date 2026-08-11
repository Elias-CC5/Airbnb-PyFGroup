import { api, serverFetch } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import type { Amenity, AmenityGroup, Category, Department, District, Province } from '@/types';

export const catalogService = {
  categories: () => api.get<Category[]>(ENDPOINTS.categories.root),
  categoriesAdmin: () => api.get<Category[]>(ENDPOINTS.categories.admin),
  createCategory: (payload: unknown) => api.post<Category>(ENDPOINTS.categories.root, payload),
  updateCategory: (id: number, payload: unknown) => api.patch<Category>(ENDPOINTS.categories.byId(id), payload),
  removeCategory: (id: number) => api.delete<{ message: string }>(ENDPOINTS.categories.byId(id)),

  amenities: () => api.get<Amenity[]>(ENDPOINTS.amenities.root),
  amenitiesGrouped: () => api.get<AmenityGroup[]>(ENDPOINTS.amenities.grouped),

  departments: () => api.get<Department[]>(ENDPOINTS.locations.departments),
  provinces: (departmentId: number) => api.get<Province[]>(ENDPOINTS.locations.provinces(departmentId)),
  districts: (provinceId: number) => api.get<District[]>(ENDPOINTS.locations.districts(provinceId)),
};

export const catalogServerService = {
  categories: () => serverFetch<Category[]>(ENDPOINTS.categories.root, undefined, 600),
  departments: () => serverFetch<Department[]>(ENDPOINTS.locations.departments, undefined, 600),
  topDestinations: (limit = 8) => serverFetch<Department[]>(ENDPOINTS.locations.top, { limit }, 600),
  amenitiesGrouped: () => serverFetch<AmenityGroup[]>(ENDPOINTS.amenities.grouped, undefined, 600),
};
