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
    <section className="relative mt-20 overflow-hidden py-16">
      <div className="container-page">
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