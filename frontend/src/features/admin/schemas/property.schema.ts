import { z } from 'zod';

/** Validación del formulario de alojamiento; refleja el DTO del backend. */
export const propertyFormSchema = z.object({
  title: z.string().min(6, 'Mínimo 6 caracteres').max(160),
  shortDescription: z.string().max(255).optional().or(z.literal('')),
  description: z.string().min(40, 'Describe el alojamiento con al menos 40 caracteres'),
  pricePerNight: z.coerce.number().min(1, 'Ingresa un precio válido'),
  cleaningFee: z.coerce.number().min(0).optional(),
  maxGuests: z.coerce.number().int().min(1),
  bedrooms: z.coerce.number().int().min(0),
  beds: z.coerce.number().int().min(1).optional(),
  bathrooms: z.coerce.number().int().min(1),
  minNights: z.coerce.number().int().min(1).optional(),
  categoryId: z.coerce.number().int().min(1, 'Selecciona una categoría'),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'INACTIVE']),
  isFeatured: z.boolean().optional(),
  whatsappPhone: z.string().max(30).optional().or(z.literal('')),
  checkInTime: z.string().max(5).optional(),
  checkOutTime: z.string().max(5).optional(),
  amenityIds: z.array(z.number()).optional(),
  location: z.object({
    departmentId: z.coerce.number().int().min(1, 'Selecciona un departamento'),
    provinceId: z.coerce.number().int().min(1, 'Selecciona una provincia'),
    districtId: z.coerce.number().int().optional(),
    address: z.string().max(200).optional().or(z.literal('')),
    reference: z.string().max(200).optional().or(z.literal('')),
  }),
});

export type PropertyFormInput = z.infer<typeof propertyFormSchema>;
