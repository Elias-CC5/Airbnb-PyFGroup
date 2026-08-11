'use client';

import { queryKeys } from '@/services/api';
import type { AvailabilityResult } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { reservationsService } from '../services/reservations.service';

export function useOccupiedDates(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.availability.occupied(propertyId),
    queryFn: () => reservationsService.occupied(propertyId),
    enabled: Boolean(propertyId),
    staleTime: 60_000,
  });
}

/** Consulta puntual de disponibilidad + precio, disparada al elegir fechas. */
export function useCheckAvailability(propertyId: string) {
  return useMutation<AvailabilityResult, Error, { checkIn: string; checkOut: string; guests?: number }>({
    mutationFn: (payload) => reservationsService.checkAvailability(propertyId, payload),
  });
}
