'use client';

import { HeroParallax, type ParallaxItem } from '@/components/ui/HeroParallax';
import type { PropertyCard } from '@/types';

interface HomeHeroProps {
  /** Alojamientos destacados: son las tarjetas que desfilan en la portada. */
  featured: PropertyCard[];
}

/** Si el catálogo viniera vacío, la portada no puede quedarse sin tarjetas. */
const RESPALDO: ParallaxItem[] = Array.from({ length: 5 }, (_, i) => ({
  title: 'PyFGroup',
  href: '/alojamientos',
  thumbnail: `https://picsum.photos/seed/pyfgroup-${i}/960/720`,
}));

const soles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  maximumFractionDigits: 0,
});

export function HomeHero({ featured }: HomeHeroProps) {
  const items: ParallaxItem[] = featured
    .map((p): ParallaxItem | null => {
      const foto = p.images.find((i) => i.isMain)?.url ?? p.images[0]?.url;
      if (!foto) return null;

      return {
        title: p.title,
        href: `/alojamiento/${p.slug}`,
        thumbnail: foto,
        meta: `${soles.format(Number(p.pricePerNight))} por noche`,
      };
    })
    .filter((x): x is ParallaxItem => x !== null);

  return (
    <HeroParallax
      items={items.length ? items : RESPALDO}
      eyebrow="Ponce & Figueroa Group S.A.C."
      title="Departamentos amoblados en Perú, administrados por nosotros."
      subtitle="Los preparamos, los limpiamos entre estadías y respondemos el teléfono cuando hace falta. Reserva en línea, paga en soles y coordina la llegada directo con nosotros."
      cta={{ label: 'Ver alojamientos', href: '/alojamientos' }}
    />
  );
}
