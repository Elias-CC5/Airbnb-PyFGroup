import type { Department } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Mosaico asimétrico: con 3+ destinos el primero ocupa el doble de espacio.
 * Con menos, cae a una grilla uniforme (el mosaico se ve roto con pocas piezas).
 */
export function PopularDestinations({ destinations }: { destinations: Department[] }) {
  const list = destinations.filter((d) => (d.propertiesCount ?? 0) > 0).slice(0, 5);
  if (!list.length) return null;

  // El destacado necesita compañía: con 1 o 2 tarjetas la fila doble queda vacía.
  const featured = list.length >= 3;

  return (
    <section className="container-page mt-20">
      <header className="mb-7">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
          Destinos que enamoran
        </h2>
        <p className="mt-1.5 text-ink-600">Explora el Perú por regiones.</p>
      </header>

      <div
        className={
          featured
            ? 'grid grid-cols-2 gap-4 auto-rows-[minmax(9rem,1fr)] lg:grid-cols-4 lg:auto-rows-[minmax(13rem,1fr)]'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
        }
      >
        {list.map((destination, index) => {
          const isBig = featured && index === 0;

          return (
            <Link
              key={destination.id}
              href={`/alojamientos?department=${destination.slug}`}
              className={`group relative isolate overflow-hidden rounded-2xl ${
                isBig
                  ? 'col-span-2 row-span-2'
                  : featured
                    ? ''
                    : 'aspect-[4/3]'
              }`}
            >
              <Image
                src={
                  destination.imageUrl ??
                  `https://picsum.photos/seed/dep-${destination.slug}/800/600`
                }
                alt={destination.name}
                fill
                sizes={
                  isBig
                    ? '(max-width: 1024px) 100vw, 50vw'
                    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                }
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p
                  className={
                    isBig
                      ? 'text-xl font-semibold text-white sm:text-2xl'
                      : 'font-semibold text-white'
                  }
                >
                  {destination.name}
                </p>
                <p className="text-xs text-white/75">
                  {destination.propertiesCount}{' '}
                  {destination.propertiesCount === 1 ? 'alojamiento' : 'alojamientos'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
