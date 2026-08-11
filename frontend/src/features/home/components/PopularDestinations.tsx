import type { Department } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

/** Mosaico asimétrico: el primer destino ocupa el doble de espacio. */
export function PopularDestinations({ destinations }: { destinations: Department[] }) {
  const list = destinations.filter((d) => (d.propertiesCount ?? 0) > 0).slice(0, 5);
  if (!list.length) return null;

  return (
    <section className="container-page mt-20">
      <header className="mb-7">
        <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
          Destinos que enamoran
        </h2>
        <p className="mt-1.5 text-ink-600">Explora el Perú por regiones.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {list.map((destination, index) => (
          <Link
            key={destination.id}
            href={`/alojamientos?department=${destination.slug}`}
            className={`group relative overflow-hidden rounded-2xl ${
              index === 0 ? 'col-span-2 row-span-2 aspect-square lg:aspect-auto' : 'aspect-[4/3]'
            }`}
          >
            <Image
              src={destination.imageUrl ?? `https://picsum.photos/seed/dep-${destination.slug}/800/600`}
              alt={destination.name}
              fill
              sizes={index === 0 ? '50vw' : '25vw'}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className={index === 0 ? 'text-xl font-semibold text-white sm:text-2xl' : 'font-semibold text-white'}>
                {destination.name}
              </p>
              <p className="text-xs text-white/75">{destination.propertiesCount} alojamientos</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
