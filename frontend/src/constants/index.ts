export * from './site';
export * from './geo';

export const CURRENCY = 'PEN';
export const CURRENCY_SYMBOL = 'S/';
export const DEFAULT_PAGE_SIZE = 12;

export const PROPERTY_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

export const BED_TYPE_LABEL: Record<string, string> = {
  SINGLE: 'Individual',
  DOUBLE: 'Doble',
  QUEEN: 'Queen',
  KING: 'King',
  BUNK: 'Camarote',
  SOFA_BED: 'Sofá cama',
};

export const CANCELLATION_POLICY_LABEL: Record<string, string> = {
  FLEXIBLE: 'Flexible',
  MODERATE: 'Moderada',
  STRICT: 'Estricta',
};

/** Explicación que se muestra al huésped en la ficha del alojamiento. */
export const CANCELLATION_POLICY_DETAIL: Record<string, string> = {
  FLEXIBLE: 'Cancelación gratuita hasta 24 horas antes del check-in.',
  MODERATE: 'Cancelación gratuita hasta 5 días antes del check-in.',
  STRICT: 'Cancelación gratuita solo dentro de las 48 horas siguientes a la reserva.',
};

export const RESERVATION_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};

export const ROLE_LABEL: Record<string, string> = {
  USER: 'Usuario',
  HOST: 'Anfitrión',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super admin',
};

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'popular', label: 'Más populares' },
] as const;