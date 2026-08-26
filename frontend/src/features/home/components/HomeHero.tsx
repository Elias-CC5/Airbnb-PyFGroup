'use client';

import { SpotlightHero } from '@/components/ui/SpotlightHero';
import type { PropertyCard } from '@/types';

interface HomeHeroProps {
  /** Alojamientos destacados: de ahí sale la foto de la portada. */
  featured: PropertyCard[];
}

/** Si el catálogo viniera vacío, la portada no puede quedarse en negro. */
const RESPALDO = 'https://picsum.photos/seed/pyfgroup-hero/1920/1080';

export function HomeHero({ featured }: HomeHeroProps) {
  const primero = featured[0];
  const foto =
    primero?.images.find((i) => i.isMain)?.url ?? primero?.images[0]?.url ?? RESPALDO;

  return (
    <SpotlightHero
      image={foto}
      titleTop="Espacios que"
      titleBottom="se sienten casa"
      intro="Departamentos amoblados en Perú que administramos nosotros mismos: los preparamos, los limpiamos entre estadías y respondemos el teléfono cuando hace falta."
      pitch="Reserva en línea, paga en soles y coordina la llegada directo con nosotros. Sin comisiones escondidas ni intermediarios."
      cta={{ label: 'Ver alojamientos', href: '/alojamientos' }}
    />
  );
}
