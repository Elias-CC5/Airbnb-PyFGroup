import { api, apiDownload } from '@/lib/api-client';
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

export type BookingChannel = 'DIRECT' | 'AIRBNB' | 'BOOKING' | 'EXPEDIA' | 'TIKTOK' | 'OTHER';

export interface OccupancyNight {
  date: string;
  reservationId: string;
  code: string;
  guest: string;
  channel: BookingChannel;
  status: string;
  pricePerNight: number;
  nights: number;
  isCheckIn: boolean;
  isCheckOut: boolean;
}

export interface ImportSummary {
  sheets: Array<{ sheet: string; month: string; reservations: number }>;
  propertiesCreated: number;
  reservationsCreated: number;
  reservationsUpdated: number;
  skipped: string[];
}

export interface OccupancyCalendar {
  month: string;
  days: string[];
  rows: Array<{ propertyId: string; title: string; slug: string; nights: OccupancyNight[] }>;
  totals: Record<string, number>;
}

export const adminService = {
  dashboard: () => api.get<DashboardStats>(ENDPOINTS.admin.dashboard),
  calendar: (month: string) =>
    api.get<OccupancyCalendar>(ENDPOINTS.admin.calendar, { query: { month } }),
  downloadCalendar: (month: string) =>
    apiDownload(ENDPOINTS.admin.calendarExport, `ocupacion_${month}.xls`, { month }),
  importCalendar: (file: File, dryRun = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<ImportSummary>(ENDPOINTS.admin.calendarImport, formData, {
      query: { dryRun },
    });
  },
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
