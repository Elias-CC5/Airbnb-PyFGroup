'use client';

import { queryKeys } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export function useDashboardStats() {
  return useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: adminService.dashboard });
}

export function useReservationsSeries(months = 12) {
  return useQuery({
    queryKey: [...queryKeys.admin.reservationsSeries, months],
    queryFn: () => adminService.reservationsSeries(months),
  });
}

export function useUsersSeries(months = 12) {
  return useQuery({
    queryKey: [...queryKeys.admin.usersSeries, months],
    queryFn: () => adminService.usersSeries(months),
  });
}

export function useTopProperties(limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.admin.topProperties, limit],
    queryFn: () => adminService.topProperties(limit),
  });
}
