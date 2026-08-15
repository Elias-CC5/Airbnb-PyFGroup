'use client';

import { Magnetic } from '@/components/ui/Magnetic';
import { Reveal } from '@/components/ui/Reveal';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PropertyCard as PropertyCardType } from '@/types';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

/** Tres mosaicos distintos; se alternan para que el revelado no se repita. */
const PATTERNS: Array<Array<{ x: number; y: number; width: number; height: number }>> = [
  // Retícula 3×3
  Array.from({ length: 9 }, (_, i) => ({
    x: (i % 3) * 160 + 20,
    y: Math.floor(i / 3) * 160 + 20,
    width: 140,
    height: 140,
  })),
  // Composición asimétrica
  [
    { x: 20, y: 20, width: 200, height: 280 },
    { x: 20, y: 320, width: 200, height: 160 },
    { x: 240, y: 20, width: 240, height: 140 },
    { x: 240, y: 180, width: 110, height: 160 },
    { x: 370, y: 180, width: 110, height: 160 },
    { x: 240, y: 360, width: 240, height: 120 },
  ],
  // Franjas verticales
  Array.from({ length: 5 }, (_, i) => ({
    x: i * 96 + 20,
    y: 20,
    width: 76,
    height: 460,
  })),
];

export function FeaturedProperties({ properties }: { properties: PropertyCardType[] }) {
  const items = properties.slice(0, 4);
  const [active, setActive] = useState(0);

  if (!items.length) return null;

  const current = items[active];
  const pattern = PATTERNS[active % PATTERNS.length];
  const image = current.images[0]?.url;
  const place = [current.location.district?.name, current.location.department.name]
    .filter(Boolean)
    .join(', ');

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div
        aria-hidden
        className="bg-aurora animate-breathe pointer-events-none absolute left-2/3 top-1/2 h-[50vh] w-[55vw] rounded-[50%] blur-[110px]"
      />

      <div className="container-page relative z-10">
        <Reveal>
          <header className="mb-14 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
                Estadías destacadas
              </h2>
              <p className="mt-1.5 text-ink-600">Los favoritos de nuestros huéspedes este mes.</p>
            </div>

            <Magnetic as="div" strength={0.18} className="hidden shrink-0 sm:block">
              <Link
                href="/alojamientos"
                className="glass-pill hover:glass-pill-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-ink-800"
              >
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </Magnetic>
          </header>
        </Reveal>

        <div className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
          {/* Lista */}
          <nav className="w-full lg:w-1/2" aria-label="Alojamientos destacados">
            <ul className="flex flex-col gap-8 sm:gap-10">
              {items.map((property, index) => {
                const isActive = index === active;
                const location = [property.location.district?.name, property.location.department.name]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <li key={property.id}>
                    <Link
                      href={`/alojamiento/${property.slug}`}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      className="group flex items-start gap-5 outline-none"
                    >
                      <span
                        className={cn(
                          'mt-2 text-xl font-bold tabular-nums transition-all duration-500',
                          isActive ? 'scale-110 text-clay-600' : 'text-ink-300',
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block text-2xl font-black uppercase leading-[0.95] tracking-tight transition-all duration-500 sm:text-3xl lg:text-4xl',
                            isActive
                              ? 'translate-x-2 text-ink-950'
                              : 'text-ink-500 group-hover:text-ink-700',
                          )}
                        >
                          {property.title}
                        </span>

                        <span
                          className={cn(
                            'mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm transition-all duration-500',
                            isActive ? 'translate-x-2 text-ink-600' : 'text-ink-500',
                          )}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" /> {location}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Star className="size-3.5 fill-clay-500 text-clay-500" />
                            {property.ratingAvg.toFixed(1)}
                          </span>
                          <span className="font-semibold text-ink-900">
                            {formatPrice(property.pricePerNight)}{' '}
                            <span className="font-normal text-ink-500">noche</span>
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mosaico */}
          <div className="relative flex w-full justify-center lg:w-1/2">
            <svg
              viewBox="0 0 500 500"
              className="h-auto w-full max-w-[520px] drop-shadow-xl"
              role="img"
              aria-label={`Fotografía de ${current.title}`}
            >
              <defs>
                {/* La clave `active` fuerza el remontaje: así el revelado se reinicia. */}
                <clipPath id="mosaico" key={active}>
                  {pattern.map((rect, i) => (
                    <rect
                      key={i}
                      className="clip-shape"
                      rx={8}
                      style={{ animationDelay: `${i * 55}ms` }}
                      {...rect}
                    />
                  ))}
                </clipPath>
              </defs>

              <g clipPath="url(#mosaico)">
                {image && (
                  <image
                    href={image}
                    width="500"
                    height="500"
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}
              </g>
            </svg>

            <p className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-ink-400">
              {place}
            </p>
          </div>
        </div>

        <Reveal className="mt-12 sm:hidden">
          <Link
            href="/alojamientos"
            className="glass-pill hover:glass-pill-hover flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-medium text-ink-800"
          >
            Ver todos los alojamientos
          </Link>
        </Reveal>
      </div>
    </section>
  );
}