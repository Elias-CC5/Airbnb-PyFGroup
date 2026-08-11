import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import type { Paginated, Review, ReviewSummary } from '@/types';

export const reviewsService = {
  byProperty: (propertyId: string, page = 1, limit = 6) =>
    api.get<Paginated<Review>>(ENDPOINTS.reviews.byProperty(propertyId), {
      query: { page, limit },
      auth: false,
    }),

  summary: (propertyId: string) =>
    api.get<ReviewSummary>(ENDPOINTS.reviews.summary(propertyId), { auth: false }),

  create: (payload: { reservationId: string; rating: number; comment: string }) =>
    api.post<Review>(ENDPOINTS.reviews.root, payload),

  mine: () => api.get<Review[]>(ENDPOINTS.reviews.mine),
  remove: (id: string) => api.delete<{ message: string }>(ENDPOINTS.reviews.byId(id)),
};
