'use client';

import { Badge, Button, ConfirmDialog } from '@/components/ui';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';
import { RESERVATION_STATUS_LABEL } from '@/constants';
import { formatDate, formatPrice } from '@/lib/format';
import type { Reservation } from '@/types';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCancelReservation } from '../hooks/useReservations';

const TONES = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'neutral',
} as const;

export function ReservationCard({ reservation }: { reservation: Reservation }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const cancel = useCancelReservation();

  const image = reservation.property.images[0]?.url;
  const place = `${reservation.property.location.province.name}, ${reservation.property.location.department.name}`;
  const canCancel = ['PENDING', 'CONFIRMED'].includes(reservation.status) && new Date(reservation.checkIn) > new Date();
  const canReview = reservation.status === 'COMPLETED' && !reservation.review;

  return (
    <>
      <article className="flex flex-col gap-4 rounded-2xl border border-ink-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <Link
          href={`/alojamiento/${reservation.property.slug}`}
          className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:size-28"
        >
          {image && <Image src={image} alt={reservation.property.title} fill sizes="112px" className="object-cover" />}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={TONES[reservation.status]}>{RESERVATION_STATUS_LABEL[reservation.status]}</Badge>
            <span className="font-mono text-xs text-ink-400">#{reservation.code}</span>
          </div>

          <h3 className="mt-1.5 truncate font-semibold text-ink-900">
            <Link href={`/alojamiento/${reservation.property.slug}`} className="hover:underline">
              {reservation.property.title}
            </Link>
          </h3>

          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {place}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatDate(reservation.checkIn)} — {formatDate(reservation.checkOut)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" /> {reservation.guests} huéspedes
            </span>
          </div>

          {reservation.cancelReason && (
            <p className="mt-2 text-xs text-danger-700">Motivo: {reservation.cancelReason}</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <p className="text-lg font-semibold text-ink-900">{formatPrice(reservation.totalPrice)}</p>
          <p className="text-xs text-ink-500">{reservation.nights} noches</p>

          <div className="mt-1 flex gap-2">
            {canReview && (
              <Button size="sm" onClick={() => setReviewOpen(true)}>
                Dejar reseña
              </Button>
            )}
            {canCancel && (
              <Button size="sm" variant="outline" onClick={() => setCancelOpen(true)}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </article>

      <ConfirmDialog
        open={cancelOpen}
        title="¿Cancelar esta reserva?"
        description={`Se cancelará la reserva #${reservation.code}. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, cancelar"
        cancelLabel="No, volver"
        loading={cancel.isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={async () => {
          await cancel.mutateAsync({ id: reservation.id }).catch(() => null);
          setCancelOpen(false);
        }}
      />

      <ReviewForm
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        reservationId={reservation.id}
        propertyTitle={reservation.property.title}
      />
    </>
  );
}
