import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Selecciona una calificación').max(5),
  comment: z
    .string()
    .min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)')
    .max(1000, 'Máximo 1000 caracteres'),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
