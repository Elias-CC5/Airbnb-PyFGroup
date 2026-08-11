'use client';

import { queryKeys } from '@/services/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { propertiesService } from '../services/properties.service';
import { cleanFilters, type PropertyFilters } from '../types/property-filters';

export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: queryKeys.properties.list(cleanFilters(filters)),
    queryFn: () => propertiesService.search(filters),
    placeholderData: keepPreviousData,
  });
}

export function useFeaturedProperties(limit = 8) {
  return useQuery({
    queryKey: queryKeys.properties.featured,
    queryFn: () => propertiesService.featured(limit),
    staleTime: 5 * 60_000,
  });
}

export function useProperty(slug: string) {
  return useQuery({
    queryKey: queryKeys.properties.detail(slug),
    queryFn: () => propertiesService.bySlug(slug),
    enabled: Boolean(slug),
  });
}
