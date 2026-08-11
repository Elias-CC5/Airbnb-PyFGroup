'use client';

import type { PropertyFilters } from '@/features/properties/types/property-filters';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Los filtros viven en la URL: enlaces compartibles, botón atrás funcional
 * y SSR consistente sin estado duplicado.
 */
export function useSearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo<PropertyFilters>(() => {
    const num = (key: string) => (params.get(key) ? Number(params.get(key)) : undefined);
    const amenities = params.get('amenities');

    return {
      q: params.get('q') ?? undefined,
      department: params.get('department') ?? undefined,
      category: params.get('category') ?? undefined,
      checkIn: params.get('checkIn') ?? undefined,
      checkOut: params.get('checkOut') ?? undefined,
      minPrice: num('minPrice'),
      maxPrice: num('maxPrice'),
      guests: num('guests'),
      bedrooms: num('bedrooms'),
      bathrooms: num('bathrooms'),
      amenities: amenities ? amenities.split(',').map(Number) : undefined,
      sort: params.get('sort') ?? 'recent',
      page: num('page') ?? 1,
      limit: 12,
    };
  }, [params]);

  const setFilters = useCallback(
    (next: Partial<PropertyFilters>, options: { resetPage?: boolean } = { resetPage: true }) => {
      const search = new URLSearchParams(params.toString());

      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) {
          search.delete(key);
        } else {
          search.set(key, Array.isArray(value) ? value.join(',') : String(value));
        }
      });

      if (options.resetPage && !('page' in next)) search.delete('page');

      router.push(`${pathname}?${search.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearFilters = useCallback(() => router.push(pathname), [pathname, router]);

  const activeCount = useMemo(
    () =>
      ['category', 'minPrice', 'maxPrice', 'guests', 'bedrooms', 'bathrooms', 'amenities'].filter((key) =>
        params.get(key),
      ).length,
    [params],
  );

  return { filters, setFilters, clearFilters, activeCount };
}
