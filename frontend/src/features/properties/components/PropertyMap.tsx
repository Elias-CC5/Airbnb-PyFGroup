'use client';

import { LocationMap } from '@/components/ui/LocationMap';
import { DEPARTMENT_COORDS, PERU_CENTER } from '@/constants/geo';
import type { PropertyLocation } from '@/types';
import { ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';

interface PropertyMapProps {
  location: PropertyLocation;
  place: string;
  reference?: string | null;
  precise?: boolean;
}

export function PropertyMap({ location, place, reference, precise = false }: PropertyMapProps) {
  // Sin coordenadas propias, se cae a la capital del departamento.
  const fallback = DEPARTMENT_COORDS[location.department.slug] ?? PERU_CENTER;
  const lat = location.latitude ?? fallback.lat;
  const lng = location.longitude ?? fallback.lng;

  const externalUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${
    precise ? 15 : 12
  }/${lat}/${lng}`;

  return (
    <section aria-labelledby="ubicacion">
      <h2 id="ubicacion" className="text-xl font-semibold text-ink-900">
        Dónde te hospedarás
      </h2>

      <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink-700">
        <MapPin className="size-4 text-ink-400" />
        {place}
      </p>

      <LocationMap location={place} lat={lat} lng={lng} precise={precise} className="mt-5" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-relaxed text-ink-500">
          {precise
            ? 'Ubicación exacta del alojamiento.'
            : 'Zona aproximada. Por seguridad, la dirección exacta se comparte una vez confirmada la reserva.'}
        </p>

        <Link
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-clay-700 hover:underline"
        >
          Ver mapa completo <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {reference && <p className="mt-3 text-sm leading-relaxed text-ink-600">{reference}</p>}
    </section>
  );
}