'use client';

import { formatPrice } from '@/lib/format';
import { X } from 'lucide-react';
import { useSearchFilters } from '../hooks/useSearchFilters';

/** Muestra los filtros activos como chips removibles. */
export function ActiveFilters() {
  const { filters, setFilters, clearFilters } = useSearchFilters();

  const chips: Array<{ key: string; label: string }> = [];
  if (filters.department) chips.push({ key: 'department', label: `Destino: ${filters.department}` });
  if (filters.category) chips.push({ key: 'category', label: `Tipo: ${filters.category}` });
  if (filters.guests) chips.push({ key: 'guests', label: `${filters.guests} huéspedes` });
  if (filters.bedrooms) chips.push({ key: 'bedrooms', label: `${filters.bedrooms} habitaciones` });
  if (filters.bathrooms) chips.push({ key: 'bathrooms', label: `${filters.bathrooms} baños` });
  if (filters.minPrice) chips.push({ key: 'minPrice', label: `Desde ${formatPrice(filters.minPrice)}` });
  if (filters.maxPrice) chips.push({ key: 'maxPrice', label: `Hasta ${formatPrice(filters.maxPrice)}` });
  if (filters.amenities?.length) chips.push({ key: 'amenities', label: `${filters.amenities.length} comodidades` });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => setFilters({ [chip.key]: undefined })}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-300 bg-white px-3 py-1.5 text-xs text-ink-700 transition hover:border-ink-500"
        >
          {chip.label}
          <X className="size-3" />
        </button>
      ))}
      <button onClick={clearFilters} className="text-xs font-medium text-clay-700 underline-offset-2 hover:underline">
        Limpiar todo
      </button>
    </div>
  );
}
