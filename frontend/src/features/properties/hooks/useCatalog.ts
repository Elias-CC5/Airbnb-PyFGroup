'use client';

import { queryKeys } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';

const LONG_CACHE = { staleTime: 10 * 60_000 };

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories.all, queryFn: catalogService.categories, ...LONG_CACHE });
}

export function useAmenitiesGrouped() {
  return useQuery({
    queryKey: queryKeys.amenities.grouped,
    queryFn: catalogService.amenitiesGrouped,
    ...LONG_CACHE,
  });
}

export function useAmenities() {
  return useQuery({ queryKey: queryKeys.amenities.all, queryFn: catalogService.amenities, ...LONG_CACHE });
}

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.locations.departments,
    queryFn: catalogService.departments,
    ...LONG_CACHE,
  });
}

export function useProvinces(departmentId?: number) {
  return useQuery({
    queryKey: queryKeys.locations.provinces(departmentId ?? 0),
    queryFn: () => catalogService.provinces(departmentId as number),
    enabled: Boolean(departmentId),
    ...LONG_CACHE,
  });
}

export function useDistricts(provinceId?: number) {
  return useQuery({
    queryKey: queryKeys.locations.districts(provinceId ?? 0),
    queryFn: () => catalogService.districts(provinceId as number),
    enabled: Boolean(provinceId),
    ...LONG_CACHE,
  });
}
