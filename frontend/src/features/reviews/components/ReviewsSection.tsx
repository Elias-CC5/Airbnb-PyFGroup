'use client';

import { Avatar, Button, Pagination, Spinner } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { usePropertyReviews, useReviewSummary } from '../hooks/useReviews';

export function ReviewsSection({ propertyId }: { propertyId: string }) {
  const [page, setPage] = useState(1);
  const { data: summary } = useReviewSummary(propertyId);
  const { data, isLoading } = usePropertyReviews(propertyId, page);

  const total = summary?.total ?? 0;

  return (
    <section aria-labelledby="resenas" className="scroll-mt-24" id="resenas-section">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id="resenas" className="text-xl font-semibold text-ink-900">
          {total > 0 ? (
            <span className="inline-flex items-center gap-2">
              <Star className="size-5 fill-clay-500 text-clay-500" />
              {summary?.average.toFixed(1)} · {total} {total === 1 ? 'reseña' : 'reseñas'}
            </span>
          ) : (
            'Aún sin reseñas'
          )}
        </h2>
      </div>

      {total > 0 && summary && (
        <div className="mt-5 max-w-md space-y-1.5">
          {summary.distribution.map((row) => (
            <div key={row.stars} className="flex items-center gap-3 text-sm">
              <span className="w-8 text-ink-600">{row.stars}★</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-ink-900 transition-[width] duration-500"
                  style={{ width: `${total ? (row.count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 text-right text-ink-500">{row.count}</span>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <Spinner label="Cargando reseñas…" />
      ) : data?.data.length ? (
        <>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2">
            {data.data.map((review) => (
              <li key={review.id}>
                <div className="flex items-center gap-3">
                  <Avatar src={review.user.avatarUrl} firstName={review.user.firstName} lastName={review.user.lastName} />
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {review.user.firstName} {review.user.lastName.charAt(0)}.
                    </p>
                    <p className="text-xs text-ink-500">{formatDate(review.createdAt, 'long')}</p>
                  </div>
                </div>

                <div className="mt-2.5 flex gap-0.5" aria-label={`${review.rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={i < review.rating ? 'size-3.5 fill-clay-500 text-clay-500' : 'size-3.5 text-ink-300'}
                    />
                  ))}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-ink-700">{review.comment}</p>
              </li>
            ))}
          </ul>

          {data.meta.totalPages > 1 && (
            <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-8" />
          )}
        </>
      ) : (
        <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-500">
          Este alojamiento todavía no tiene reseñas. Sé el primero en compartir tu experiencia después de tu
          estadía.
        </p>
      )}
    </section>
  );
}
