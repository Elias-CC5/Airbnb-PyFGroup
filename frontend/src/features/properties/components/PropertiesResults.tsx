'use client';

import { EmptyState, ErrorState, Pagination, Select } from '@/components/ui';
import { SORT_OPTIONS } from '@/constants';
import { ActiveFilters } from '@/features/search/components/ActiveFilters';
import { CategoryChips } from '@/features/search/components/CategoryChips';
import { FiltersPanel } from '@/features/search/components/FiltersPanel';
import { useSearchFilters } from '@/features/search/hooks/useSearchFilters';
import { SearchX } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { PropertyGrid } from './PropertyGrid';

/** Página de resultados: buscador + filtros + grilla paginada, todo sincronizado con la URL. */
export function PropertiesResults() {
  const { filters, setFilters, clearFilters } = useSearchFilters();
  const { data, isLoading, isError, refetch } = useProperties(filters);

  const total = data?.meta.total ?? 0;

  return (
    <div className="container-page pt-24 sm:pt-28 pb-6 sm:pb-8">
      <div className="mx-auto max-w-4xl">
      </div>

      <div className="mt-4 space-y-4">
        <CategoryChips />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-600">
            {isLoading ? 'Buscando alojamientos…' : `${total} ${total === 1 ? 'alojamiento' : 'alojamientos'} disponibles`}
          </p>

          <div className="flex items-center gap-2.5">
            <FiltersPanel />
            <Select
              aria-label="Ordenar resultados"
              value={filters.sort ?? 'recent'}
              onChange={(e) => setFilters({ sort: e.target.value })}
              className="h-9 w-auto min-w-44 rounded-[10px] text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <ActiveFilters />
      </div>

      <div className="mt-8">
        {isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : !isLoading && total === 0 ? (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="No encontramos alojamientos"
            description="Prueba ampliando las fechas, subiendo el precio máximo o quitando algunos filtros."
            action={
              <button onClick={clearFilters} className="text-sm font-medium text-clay-700 hover:underline">
                Limpiar todos los filtros
              </button>
            }
          />
        ) : (
          <>
            <PropertyGrid properties={data?.data ?? []} loading={isLoading} />
            {data && data.meta.totalPages > 1 && (
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onChange={(page) => {
                  setFilters({ page }, { resetPage: false });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-12"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}