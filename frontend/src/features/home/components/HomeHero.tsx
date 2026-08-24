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
  // blanco, así que no hace falta una segunda imagen.
  const principal = foto(featured[0]) ?? RESPALDO;

  return (
    <ScrollExpandHero
      mediaSrc={principal}
      eyebrow="Alojamientos con alma peruana"
      title="PyFGroup te espera"
      hint="Desliza para descubrirlo"
    >
      {/*
        Va centrado sobre la foto abierta, así que el texto es blanco y se
        apoya en el velo oscuro que el hero enciende al expandirse.
      */}
      <div className="mx-auto max-w-2xl text-center text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.55)]">
        <p className="text-2xl font-medium leading-snug sm:text-3xl">
          Somos PyFGroup, una operadora peruana de alojamientos temporales.
        </p>
        <p className="mt-6 text-base leading-relaxed text-white/85 sm:text-lg">
          Administramos cada departamento nosotros mismos: los amoblamos, los limpiamos entre
          estadía y estadía y respondemos el teléfono cuando algo hace falta.
        </p>
        <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
          Reserva en línea, paga en soles y coordina la llegada directo con nosotros. Sin comisiones
          escondidas ni intermediarios.
        </p>
      </div>
    </ScrollExpandHero>
  );
}
