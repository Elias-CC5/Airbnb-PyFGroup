import { z } from 'zod';

export const complaintSchema = z.object({
  type: z.enum(['RECLAMO', 'QUEJA'], { required_error: 'Selecciona el tipo' }),
  fullName: z.string().min(3, 'Ingresa tu nombre completo').max(160),
  docType: z.string().min(1, 'Selecciona un tipo de documento'),
  docNumber: z.string().min(6, 'Número de documento inválido').max(20),
  address: z.string().min(5, 'Ingresa tu domicilio').max(255),
  phone: z.string().max(30).optional().or(z.literal('')),
  email: z.string().email('Correo inválido'),
  itemDescription: z.string().min(5, 'Describe el bien o servicio').max(500),
  amount: z.coerce.number().positive().optional().or(z.literal('')),
  reservationCode: z.string().max(20).optional().or(z.literal('')),
  detail: z.string().min(10, 'Cuéntanos con más detalle qué pasó').max(2000),
  request: z.string().min(5, 'Indica qué solicitas').max(1000),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;