'use client';

import { ScrollExpandHero } from '@/components/ui/ScrollExpandHero';
import { Button } from '@/components/ui';
import type { PropertyCard } from '@/types';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HomeHeroProps {
  /** Alojamientos destacados: de ahí salen las fotos del hero. */
  featured: PropertyCard[];
  stays?: number;
  regions?: number;
}

const RESPALDO = 'https://picsum.photos/seed/pyfgroup-hero/1920/1080';

const foto = (property?: PropertyCard) =>
  property?.images.find((i) => i.isMain)?.url ?? property?.images[0]?.url;

export function HomeHero({ featured, stays, regions }: HomeHeroProps) {
  // La primera foto es la que crece; la segunda queda de fondo. Si sólo hay
  // una, se usa la misma para las dos y el efecto sigue funcionando.
  const principal = foto(featured[0]) ?? RESPALDO;
  const fondo = foto(featured[1]) ?? principal;

  return (
    <ScrollExpandHero
      mediaSrc={principal}
      bgImageSrc={fondo}
      eyebrow="Alojamientos con alma peruana"
      title="Perú te espera"
      hint="Desliza para descubrirlo"
    >
      <div className="container-page pb-20 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Casas, departamentos y cabañas verificadas una por una
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-600">
            Reserva en línea, paga en soles y coordina directo con el anfitrión. Sin comisiones
            escondidas ni intermediarios.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/alojamientos">
                Explorar alojamientos <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Link
              href="/destinos"
              className="text-sm text-ink-600 underline underline-offset-4 transition hover:text-ink-900"
            >
              Ver destinos
            </Link>
          </div>

          {(stays || regions) && (
            <dl className="mt-12 flex justify-center gap-12 border-t border-ink-200 pt-8">
              {stays ? (
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-ink-500">
                    Alojamientos
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-ink-900">{stays}</dd>
                </div>
              ) : null}
              {regions ? (
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-ink-500">Regiones</dt>
                  <dd className="mt-1 text-2xl font-bold text-ink-900">{regions}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </div>
      </div>
    </ScrollExpandHero>
  );
}
