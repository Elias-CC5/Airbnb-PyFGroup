'use client';

import { Button, Label, Modal, RatingInput, Textarea } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useCreateReview } from '../hooks/useReviews';
import { reviewSchema, type ReviewInput } from '../schemas/review.schema';

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  /** Opcional: vincula la reseña a una estadía completada (reseña verificada). */
  reservationId?: string;
  propertyTitle: string;
}

export function ReviewForm({ open, onClose, propertyId, reservationId, propertyTitle }: ReviewFormProps) {
  const createReview = useCreateReview();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewInput>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, comment: '' } });

  const onSubmit = handleSubmit(async (values) => {
    const created = await createReview
      .mutateAsync({ propertyId, reservationId, ...values })
      .catch(() => null);
    if (created) {
      reset();
      onClose();
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={reservationId ? '¿Cómo fue tu estadía?' : 'Deja tu reseña'}
      description={propertyTitle}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} loading={createReview.isPending}>
            Publicar reseña
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label required>Tu calificación</Label>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => <RatingInput value={field.value} onChange={field.onChange} />}
          />
          {errors.rating && <p className="mt-1.5 text-xs text-danger-700">{errors.rating.message}</p>}
        </div>

        <div>
          <Label htmlFor="comment" required>Tu comentario</Label>
          <Textarea
            id="comment"
            placeholder="Cuéntanos qué te gustó, cómo estuvo la limpieza, la ubicación, la atención del anfitrión…"
            maxLength={1000}
            error={errors.comment?.message}
            {...register('comment')}
          />
        </div>
      </form>
    </Modal>
  );
}
