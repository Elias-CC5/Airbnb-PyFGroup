'use client';

import { queryKeys } from '@/services/api';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewsService } from '../services/reviews.service';

export function usePropertyReviews(propertyId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.reviews.byProperty(propertyId, page),
    queryFn: () => reviewsService.byProperty(propertyId, page),
    enabled: Boolean(propertyId),
    placeholderData: keepPreviousData,
  });
}

export function useReviewSummary(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.summary(propertyId),
    queryFn: () => reviewsService.summary(propertyId),
    enabled: Boolean(propertyId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewsService.create,
    onSuccess: () => {
      toast.success('¡Gracias por compartir tu experiencia!');
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
