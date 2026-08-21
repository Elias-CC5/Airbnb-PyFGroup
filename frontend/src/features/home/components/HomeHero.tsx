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
      title="Perú te espera"
      hint="Desliza para descubrirlo"
    >
      {/*
        Texto que aparece cuando la foto termina de abrirse. Va sin botones ni
        cifras a propósito: el hero ya pide una acción —seguir bajando— y meter
        otra compite con ella.
      */}
      <div className="container-page pb-24 pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xl leading-relaxed text-ink-900 sm:text-2xl">
            Somos PyFGroup, una operadora peruana de alojamientos temporales.
          </p>
          <p className="mt-5 text-base leading-relaxed text-ink-600">
            Administramos cada departamento nosotros mismos: los amoblamos, los limpiamos entre
            estadía y estadía y respondemos el teléfono cuando algo hace falta. No somos un
            catálogo de anuncios ajenos, y por eso podemos decir que lo que ves en las fotos es lo
            que encuentras al abrir la puerta.
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            Reserva en línea, paga en soles y coordina la llegada directo con nosotros. Sin
            comisiones escondidas ni intermediarios.
          </p>
        </div>
      </div>
    </ScrollExpandHero>
  );
}
