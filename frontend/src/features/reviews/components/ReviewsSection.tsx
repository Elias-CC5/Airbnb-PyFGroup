'use client';

import { Avatar, Button, Pagination, Spinner } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMyReservations } from '@/features/reservations/hooks/useReservations';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PenLine, Star } from 'lucide-react';
import { useState } from 'react';
import { usePropertyReviews, useReviewSummary } from '../hooks/useReviews';
import { ReviewForm } from './ReviewForm';

/** Fila de 5 estrellas, monocroma para no romper la paleta del sitio. */
function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-label={`${value} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            'size-3.5',
            i < Math.round(value) ? 'fill-ink-900 text-ink-900' : 'fill-ink-100 text-ink-300',
          )}
        />
      ))}
    </span>
  );
}

/**
 * Invitación a reseñar. Sólo se monta con sesión iniciada, porque consulta
 * /reservations/me. El backend exige una reserva COMPLETED sin reseña previa,
 * así que replicamos esa regla aquí en vez de mostrar un formulario que fallaría.
 */
function WriteReviewCard({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [open, setOpen] = useState(false);
  const { data } = useMyReservations({ status: 'COMPLETED' });

  const eligible = data?.data.find((r) => r.property.id === propertyId && !r.review);
  if (!eligible) return null;

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-ink-300 bg-ink-50 px-6 py-5">
        <div className="flex items-start gap-3">
          <PenLine className="mt-0.5 size-5 shrink-0 text-ink-500" />
          <div>
            <p className="text-sm font-medium text-ink-900">Te hospedaste aquí</p>
            <p className="text-sm text-ink-600">
              Califica de 1 a 5 estrellas y cuenta cómo te fue.
            </p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>Escribir reseña</Button>
      </div>

      <ReviewForm
        open={open}
        onClose={() => setOpen(false)}
        reservationId={eligible.id}
        propertyTitle={propertyTitle}
      />
    </>
  );
}

interface ReviewsSectionProps {
  propertyId: string;
  propertyTitle: string;
  /** Índice editorial que se muestra sobre el título, p. ej. "06". */
  index?: string;
}

export function ReviewsSection({ propertyId, propertyTitle, index }: ReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuth();
  const { data: summary } = useReviewSummary(propertyId);
  const { data, isLoading } = usePropertyReviews(propertyId, page);

  const total = summary?.total ?? 0;
  const average = summary?.average ?? 0;

  return (
    <section aria-labelledby="resenas" className="scroll-mt-28" id="resenas-section">
      {index && (
        <span className="block font-mono text-xs tracking-[0.2em] text-ink-400">{index}</span>
      )}

      <h2 id="resenas" className="mt-2 text-display text-3xl text-ink-900 sm:text-4xl">
        {total > 0 ? 'Lo que dicen los huéspedes' : 'Todavía sin reseñas'}
      </h2>

      {total > 0 && summary ? (
        <div className="mt-8 grid gap-10 border-y border-ink-200 py-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-16">
          {/* Promedio */}
          <div>
            <p className="text-display text-6xl leading-none text-ink-900">
              {average.toFixed(1)}
              <span className="text-2xl text-ink-400">/5</span>
            </p>
            <Stars value={average} className="mt-3" />
            <p className="mt-2 text-sm text-ink-500">
              {total} {total === 1 ? 'reseña' : 'reseñas'}
            </p>
          </div>

          {/* Distribución */}
          <div className="space-y-2 self-center">
            {summary.distribution.map((row) => {
              const pct = total ? (row.count / total) * 100 : 0;
              return (
                <div key={row.stars} className="flex items-center gap-4 text-sm">
                  <span className="w-3 font-mono text-ink-500">{row.stars}</span>
                  <div className="h-px flex-1 bg-ink-200">
                    <div
                      className="h-px bg-ink-900 transition-[width] duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-xs text-ink-400">{row.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-500">
          Este alojamiento aún no tiene reseñas. Después de tu estadía podrás calificarlo y
          contar cómo te fue.
        </p>
      )}

      {isAuthenticated && <WriteReviewCard propertyId={propertyId} propertyTitle={propertyTitle} />}

      {isLoading ? (
        <div className="mt-10">
          <Spinner label="Cargando reseñas…" />
        </div>
      ) : data?.data.length ? (
        <>
          <ul className="mt-10 grid gap-x-14 gap-y-10 md:grid-cols-2">
            {data.data.map((review) => (
              <li key={review.id} className="border-t border-ink-200 pt-6">
                <Stars value={review.rating} />

                <blockquote className="mt-3 break-words text-[0.95rem] leading-relaxed text-ink-800">
                  {review.comment}
                </blockquote>

                <div className="mt-4 flex items-center gap-3">
                  <Avatar
                    src={review.user.avatarUrl}
                    firstName={review.user.firstName}
                    lastName={review.user.lastName}
                    size="sm"
                  />
                  <p className="text-sm text-ink-600">
                    <span className="font-medium text-ink-900">
                      {review.user.firstName} {review.user.lastName.charAt(0)}.
                    </span>
                    <span className="mx-1.5 text-ink-300">·</span>
                    {formatDate(review.createdAt, 'long')}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {data.meta.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={data.meta.totalPages}
              onChange={setPage}
              className="mt-10"
            />
          )}
        </>
      ) : null}
    </section>
  );
}
