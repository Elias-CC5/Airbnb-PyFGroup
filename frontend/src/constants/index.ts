export * from './site';

export const CURRENCY = 'PEN';
export const CURRENCY_SYMBOL = 'S/';
export const DEFAULT_PAGE_SIZE = 12;

export const PROPERTY_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
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
