'use client';

import { ScrollExpandHero } from '@/components/ui/ScrollExpandHero';
import type { PropertyCard } from '@/types';

interface HomeHeroProps {
  /** Alojamientos destacados: de ahí sale la foto del hero. */
  featured: PropertyCard[];
}

const RESPALDO = 'https://picsum.photos/seed/pyfgroup-hero/1920/1080';

const foto = (property?: PropertyCard) =>
  property?.images.find((i) => i.isMain)?.url ?? property?.images[0]?.url;

export function HomeHero({ featured }: HomeHeroProps) {
  // Una sola foto: la del primer destacado. El fondo ya no es otra foto sino
  // un degradado oscuro, así que no hace falta una segunda imagen.
  const principal = foto(featured[0]) ?? RESPALDO;

  return (
    <ScrollExpandHero
      mediaSrc={principal}
      eyebrow="Alojamientos con alma peruana"
      title="Perú te espera"
      hint="Desliza para descubrirlo"
    />
  );
}
