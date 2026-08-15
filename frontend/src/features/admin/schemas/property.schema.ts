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

  // Reglas de la casa
  petsAllowed: z.boolean().optional(),
  smokingAllowed: z.boolean().optional(),
  partiesAllowed: z.boolean().optional(),
  suitableForChildren: z.boolean().optional(),
  quietHoursFrom: z.string().max(5).optional().or(z.literal('')),
  quietHoursTo: z.string().max(5).optional().or(z.literal('')),
  houseRules: z.string().max(2000).optional().or(z.literal('')),

  // Detalles del espacio
  areaM2: z.coerce.number().int().min(1).optional(),
  floor: z.coerce.number().int().min(0).optional(),
  hasElevator: z.boolean().optional(),
  bedType: z.enum(['SINGLE', 'DOUBLE', 'QUEEN', 'KING', 'BUNK', 'SOFA_BED']).optional().or(z.literal('')),
  viewType: z.string().max(60).optional().or(z.literal('')),

  // Políticas y cobros
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT']).optional(),
  securityDeposit: z.coerce.number().min(0).optional(),
  extraGuestFee: z.coerce.number().min(0).optional(),
  weeklyDiscount: z.coerce.number().int().min(0).max(90).optional(),
  monthlyDiscount: z.coerce.number().int().min(0).max(90).optional(),

  location: z.object({
    departmentId: z.coerce.number().int().min(1, 'Selecciona un departamento'),
    provinceId: z.coerce.number().int().min(1, 'Selecciona una provincia'),
    districtId: z.coerce.number().int().optional(),
    address: z.string().max(200).optional().or(z.literal('')),
    reference: z.string().max(200).optional().or(z.literal('')),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  }),
});

export type PropertyFormInput = z.infer<typeof propertyFormSchema>;
