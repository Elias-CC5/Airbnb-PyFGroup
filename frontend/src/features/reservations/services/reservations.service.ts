import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import type { AvailabilityResult, OccupiedRange, Paginated, Reservation, ReservationStatus } from '@/types';

export interface CreateReservationPayload {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  notes?: string;
}

export const reservationsService = {
  create: (payload: CreateReservationPayload) =>
    api.post<Reservation>(ENDPOINTS.reservations.root, payload),

  mine: (query: { page?: number; limit?: number; status?: ReservationStatus }) =>
    api.get<Paginated<Reservation>>(ENDPOINTS.reservations.mine, { query }),

  all: (query: Record<string, unknown>) =>
    api.get<Paginated<Reservation>>(ENDPOINTS.reservations.root, { query }),

  byId: (id: string) => api.get<Reservation>(ENDPOINTS.reservations.byId(id)),

  updateStatus: (id: string, status: ReservationStatus, reason?: string) =>
    api.patch<Reservation>(ENDPOINTS.reservations.status(id), { status, reason }),

  cancel: (id: string, reason?: string) =>
    api.patch<Reservation>(ENDPOINTS.reservations.cancel(id), { reason }),

  checkAvailability: (propertyId: string, payload: { checkIn: string; checkOut: string; guests?: number }) =>
    api.post<AvailabilityResult>(ENDPOINTS.availability.check(propertyId), payload, { auth: false }),

  occupied: (propertyId: string) =>
    api.get<OccupiedRange[]>(ENDPOINTS.availability.occupied(propertyId), { auth: false }),
};
