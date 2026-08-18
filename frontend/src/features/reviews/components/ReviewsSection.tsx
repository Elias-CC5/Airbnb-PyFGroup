'use client';

import { Avatar, Button, Pagination, Spinner } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePropertyReviews, useReviewSummary } from '../hooks/useReviews';
import { ReviewForm } from './ReviewForm';

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-label={`${value} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            'size-3.5',
            i < Math.round(value) ? 'fill-ink-900 text-ink-900' : 'fill-ink-100 text-ink-200',
          )}
        />
      ))}
    </span>
  );
}

interface ReviewsSectionProps {
  propertyId: string;
  propertyTitle: string;
}

export function ReviewsSection({ propertyId, propertyTitle }: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const { data: summary } = useReviewSummary(propertyId);
  const { data, isLoading } = usePropertyReviews(propertyId, page);

  const total = summary?.total ?? 0;
  const average = summary?.average ?? 0;
  const reviews = data?.data ?? [];

  // El servidor permite una reseña por usuario y alojamiento; ocultamos el botón
  // si ya vemos la suya en la lista para no ofrecer una acción que fallaría.
  const alreadyReviewed = Boolean(user && reviews.some((r) => r.user.id === user.id));

  return (
    <section aria-labelledby="resenas" className="scroll-mt-28" id="resenas-section">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="resenas" className="text-lg font-semibold text-ink-900">
          Reseñas
          {total > 0 && <span className="ml-2 font-normal text-ink-400">{total}</span>}
        </h2>

        {isAuthenticated ? (
          !alreadyReviewed && (
            <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
              Escribir reseña
            </Button>
          )
        ) : (
          <Link
            href="/login"
            className="text-sm text-ink-600 underline underline-offset-4 transition hover:text-ink-900"
          >
            Inicia sesión para reseñar
          </Link>
        )}
      </div>

      {total > 0 && summary ? (
        <div className="mt-6 grid gap-8 rounded-2xl border border-ink-200 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-12">
          <div className="flex items-center gap-4 sm:block">
            <p className="text-4xl font-semibold tracking-tight text-ink-900">
              {average.toFixed(1)}
            </p>
            <div className="sm:mt-2">
              <Stars value={average} />
              <p className="mt-1 text-xs text-ink-500">
                {total} {total === 1 ? 'reseña' : 'reseñas'}
              </p>
            </div>
          </div>

          <div className="space-y-2 self-center">
            {summary.distribution.map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs">
                <span className="w-2 text-ink-500">{row.stars}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full bg-ink-900 transition-[width] duration-500 ease-out"
                    style={{ width: `${total ? (row.count / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right text-ink-400">{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-500">
          Este alojamiento todavía no tiene reseñas.
          {isAuthenticated && !alreadyReviewed && ' Sé el primero en dejar la tuya.'}
        </p>
      )}

      {isLoading ? (
        <div className="mt-8">
          <Spinner label="Cargando reseñas…" />
        </div>
      ) : reviews.length > 0 ? (
        <>
          <ul className="mt-8 divide-y divide-ink-200 border-t border-ink-200">
            {reviews.map((review) => (
              <li key={review.id} className="py-6">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={review.user.avatarUrl}
                    firstName={review.user.firstName}
                    lastName={review.user.lastName}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {review.user.firstName} {review.user.lastName.charAt(0)}.
                    </p>
                    <p className="text-xs text-ink-400">{formatDate(review.createdAt, 'long')}</p>
                  </div>
                  <Stars value={review.rating} className="ml-auto shrink-0" />
                </div>

                <p className="mt-3 break-words text-sm leading-relaxed text-ink-700">
                  {review.comment}
                </p>
              </li>
            ))}
          </ul>

          {data && data.meta.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={data.meta.totalPages}
              onChange={setPage}
              className="mt-8"
            />
          )}
        </>
      ) : null}

      <ReviewForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
      />
    </section>
  );
}
