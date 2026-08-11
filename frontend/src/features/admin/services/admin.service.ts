import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import type { DashboardStats, Paginated, User } from '@/types';

export interface MonthlyPoint {
  month: string;
  reservations: number;
  revenue: number;
}

export interface TopProperty {
  id: string;
  title: string;
  slug: string;
  views: number;
  ratingAvg: number;
  reviewsCount: number;
  pricePerNight: string | number;
  images: Array<{ url: string }>;
  _count: { reservations: number };
}

export const adminService = {
  dashboard: () => api.get<DashboardStats>(ENDPOINTS.admin.dashboard),
  reservationsSeries: (months = 12) =>
    api.get<MonthlyPoint[]>(ENDPOINTS.admin.reservationsSeries, { query: { months } }),
  usersSeries: (months = 12) =>
    api.get<Array<{ month: string; total: number }>>(ENDPOINTS.admin.usersSeries, { query: { months } }),
  topProperties: (limit = 5) => api.get<TopProperty[]>(ENDPOINTS.admin.topProperties, { query: { limit } }),
  recentReservations: (limit = 8) => api.get<unknown[]>(ENDPOINTS.admin.recent, { query: { limit } }),

  users: (query: Record<string, unknown>) => api.get<Paginated<User>>(ENDPOINTS.users.root, { query }),
  updateUserRole: (id: string, role: string) => api.patch<User>(ENDPOINTS.users.role(id), { role }),
  activateUser: (id: string) => api.patch<User>(ENDPOINTS.users.activate(id)),
  deactivateUser: (id: string) => api.patch<User>(ENDPOINTS.users.deactivate(id)),
  removeUser: (id: string) => api.delete<{ message: string }>(ENDPOINTS.users.byId(id)),
};
