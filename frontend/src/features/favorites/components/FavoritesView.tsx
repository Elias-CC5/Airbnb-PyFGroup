'use client';

import { Button, EmptyState, ErrorState, Pagination } from '@/components/ui';
import { PropertyGrid } from '@/features/properties/components/PropertyGrid';
import { HeartOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useFavoritesList } from '../hooks/useFavorites';

export function FavoritesView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useFavoritesList(page);

  return (
    <div>
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Favoritos</h1>
        <p className="mt-1 text-sm text-ink-600">Los alojamientos que guardaste para después.</p>
      </header>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !isLoading && !data?.data.length ? (
        <EmptyState
          icon={<HeartOff className="size-6" />}
          title="Todavía no guardaste nada"
          description="Toca el corazón en cualquier alojamiento para tenerlo a mano."
          action={
            <Button asChild>
              <Link href="/alojamientos">Explorar alojamientos</Link>
            </Button>
          }
        />
      ) : (
        <>
          <PropertyGrid properties={data?.data ?? []} loading={isLoading} skeletonCount={4} />
          {data && data.meta.totalPages > 1 && (
            <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-10" />
          )}
        </>
      )}
    </div>
  );
}
