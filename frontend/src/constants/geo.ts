/** Coordenadas aproximadas de las capitales departamentales del Perú. */
export const DEPARTMENT_COORDS: Record<string, { lat: number; lng: number }> = {
  cusco: { lat: -13.5319, lng: -71.9675 },
  lima: { lat: -12.0464, lng: -77.0428 },
  arequipa: { lat: -16.409, lng: -71.5375 },
  ica: { lat: -14.0678, lng: -75.7286 },
  piura: { lat: -5.1945, lng: -80.6328 },
  'la-libertad': { lat: -8.1116, lng: -79.0288 },
  puno: { lat: -15.8402, lng: -70.0219 },
  junin: { lat: -12.0653, lng: -75.2049 },
  ancash: { lat: -9.5278, lng: -77.5278 },
  loreto: { lat: -3.7437, lng: -73.2516 },
};

/** Centro del Perú, por si no hay ninguna coincidencia. */
export const PERU_CENTER = { lat: -9.19, lng: -75.0152 };