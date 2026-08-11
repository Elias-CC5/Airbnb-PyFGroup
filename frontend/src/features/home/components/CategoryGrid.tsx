'use client';

import { CoverflowCarousel } from '@/components/ui/CoverflowCarousel';
import { Magnetic } from '@/components/ui/Magnetic';
import { Reveal } from '@/components/ui/Reveal';
import type { Category } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const router = useRouter();

  const slides = useMemo(
    () =>
      categories.map((category) => ({
        src: category.imageUrl ?? `https://picsum.photos/seed/${category.slug}/640/640`,
        alt: category.name,
        title: category.name,
        subtitle: `${category._count?.properties ?? 0} alojamientos`,
        href: `/alojamientos?category=${category.slug}`,
      })),
    [categories],
  );

  if (!categories.length) return null;

  return (
    <section className="relative z-10 -mt-10 overflow-hidden rounded-t-[40px] bg-white pb-16 pt-20 shadow-[0_-24px_60px_-20px_rgba(28,25,23,0.45)]">
      {/* Capas ambientales */}
      <div
        aria-hidden
        className="bg-aurora animate-breathe pointer-events-none absolute left-1/2 top-1/2 h-[50vh] w-[80vw] rounded-[50%] blur-[90px]"
      />
      <div aria-hidden className="bg-grid-soft pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="text-giant-outline pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[22vw]"
      >
        ESTADÍAS
      </div>

      <div className="container-page relative z-10">
        <Reveal>
          <header className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
                Encuentra tu tipo de estadía
              </h2>
              <p className="mt-1.5 text-ink-600">
                Arrastra para explorar. Desde una cabaña en la sierra hasta una villa frente al mar.
              </p>
            </div>

            <Magnetic as="div" strength={0.18} className="hidden shrink-0 sm:block">
              <Link
                href="/alojamientos"
                className="glass-pill hover:glass-pill-hover inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-ink-800"
              >
                Ver todo
              </Link>
            </Magnetic>
          </header>
        </Reveal>

        <Reveal delay={80}>
          <CoverflowCarousel
            slides={slides}
            label="Tipos de alojamiento"
            showNavigation
            showPagination
            // Al pulsar la tarjeta central se abre esa categoría.
            onActivate={(index) => router.push(slides[index].href)}
          />
        </Reveal>
      </div>
    </section>
  );
}