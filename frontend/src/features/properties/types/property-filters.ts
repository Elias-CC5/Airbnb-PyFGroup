export interface PropertyFilters {
  q?: string;
  department?: string;
  departmentId?: number;
  provinceId?: number;
  districtId?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: number[];
  checkIn?: string;
  checkOut?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

/** Limpia el objeto de filtros para no ensuciar la URL ni la caché. */
export function cleanFilters(filters: PropertyFilters): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  );
}
