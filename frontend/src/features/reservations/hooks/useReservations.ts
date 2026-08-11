'use client';

import { queryKeys } from '@/services/api';
import type { ReservationStatus } from '@/types';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reservationsService, type CreateReservationPayload } from '../services/reservations.service';

export function useMyReservations(filters: { page?: number; status?: ReservationStatus }) {
  return useQuery({
    queryKey: queryKeys.reservations.mine(filters),
    queryFn: () => reservationsService.mine(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminReservations(filters: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.reservations.admin(filters),
    queryFn: () => reservationsService.all(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReservationPayload) => reservationsService.create(payload),
    onSuccess: (reservation) => {
      toast.success(`Reserva ${reservation.code} creada`);
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => reservationsService.cancel(id, reason),
    onSuccess: () => {
      toast.success('Reserva cancelada');
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: ReservationStatus; reason?: string }) =>
      reservationsService.updateStatus(id, status, reason),
    onSuccess: () => {
      toast.success('Estado actualizado');
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
