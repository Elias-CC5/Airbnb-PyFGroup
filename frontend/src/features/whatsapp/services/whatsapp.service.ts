import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import { SITE } from '@/constants';
import type { WhatsappLink } from '@/types';

export const whatsappService = {
  forProperty: (propertyId: string, query?: { checkIn?: string; checkOut?: string; guests?: number }) =>
    api.get<WhatsappLink>(ENDPOINTS.whatsapp.property(propertyId), { query, auth: false }),

  support: () => api.get<WhatsappLink>(ENDPOINTS.whatsapp.support, { auth: false }),
};

/**
 * Enlace generado en el cliente, sin round-trip al backend.
 * El backend expone la misma plantilla para clientes no web.
 */
export function buildWhatsappUrl(params: {
  phone?: string | null;
  propertyTitle: string;
  location: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}): string {
  const digits = (params.phone ?? SITE.whatsapp).replace(/\D/g, '');
  const phone = digits.length === 9 ? `51${digits}` : digits;

  const lines = [
    `Hola, estoy interesado en el alojamiento "${params.propertyTitle}" ubicado en ${params.location}.`,
  ];
  if (params.checkIn && params.checkOut) lines.push(`Fechas: del ${params.checkIn} al ${params.checkOut}.`);
  if (params.guests) lines.push(`Huéspedes: ${params.guests}.`);
  lines.push('Quisiera consultar disponibilidad. ¡Gracias!');

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Mensaje para el anfitrión cuando la reserva YA fue creada en el sistema.
 * Incluye el código para que ambos puedan referirse a la misma reserva.
 */
export function buildReservationWhatsappUrl(params: {
  phone?: string | null;
  code: string;
  propertyTitle: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total?: string;
  notes?: string;
}): string {
  const digits = (params.phone ?? SITE.whatsapp).replace(/\D/g, '');
  const phone = digits.length === 9 ? `51${digits}` : digits;

  const lines = [
    `¡Hola! Acabo de reservar "${params.propertyTitle}" (${params.location}).`,
    `Código de reserva: ${params.code}`,
    `Fechas: del ${params.checkIn} al ${params.checkOut}.`,
    `Huéspedes: ${params.guests}.`,
  ];
  if (params.total) lines.push(`Total: ${params.total}`);
  if (params.notes) lines.push(`Nota: ${params.notes}`);
  lines.push('Quedo atento a la confirmación. ¡Gracias!');

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
