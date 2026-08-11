'use client';

import { useCategories } from '@/features/properties/hooks/useCatalog';
import { cn } from '@/lib/utils';
import { useSearchFilters } from '../hooks/useSearchFilters';

/** Carrusel horizontal de categorías, estilo "filtro rápido". */
export function CategoryChips() {
  const { data: categories, isLoading } = useCategories();
  const { filters, setFilters } = useSearchFilters();

  if (isLoading) {
    return (
      <div className="flex gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-9 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1" role="tablist" aria-label="Categorías">
      <button
        role="tab"
        aria-selected={!filters.category}
        onClick={() => setFilters({ category: undefined })}
        className={cn(
          'shrink-0 rounded-full border px-4 py-2 text-sm transition',
          !filters.category
            ? 'border-ink-900 bg-ink-900 text-white'
            : 'border-ink-200 text-ink-700 hover:border-ink-400 hover:bg-ink-50',
        )}
      >
        Todo
      </button>

      {categories?.map((category) => (
        <button
          key={category.id}
          role="tab"
          aria-selected={filters.category === category.slug}
          onClick={() => setFilters({ category: category.slug })}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-sm transition',
            filters.category === category.slug
              ? 'border-ink-900 bg-ink-900 text-white'
              : 'border-ink-200 text-ink-700 hover:border-ink-400 hover:bg-ink-50',
          )}
        >
          {category.name}
          {category._count?.properties ? (
            <span className="ml-1.5 text-xs opacity-60">{category._count.properties}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
