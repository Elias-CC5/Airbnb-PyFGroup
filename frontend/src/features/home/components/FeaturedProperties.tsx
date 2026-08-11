import { Magnetic } from '@/components/ui/Magnetic';
import { Reveal } from '@/components/ui/Reveal';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import type { PropertyCard as PropertyCardType } from '@/types';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FeaturedProperties({ properties }: { properties: PropertyCardType[] }) {
  if (!properties.length) return null;

  return (
    <section className="relative mt-24 overflow-hidden py-16">
      <div
        aria-hidden
        className="bg-aurora animate-breathe pointer-events-none absolute left-1/4 top-1/2 h-[45vh] w-[60vw] rounded-[50%] blur-[100px]"
      />

      <div className="container-page relative z-10">
        <Reveal>
          <header className="mb-9 flex items-end justify-between gap-4">
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

        <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.slice(0, 8).map((property, index) => (
            <Reveal key={property.id} delay={(index % 4) * 80}>
              <PropertyCard property={property} priority={index < 4} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 sm:hidden">
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