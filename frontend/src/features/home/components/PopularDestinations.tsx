import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import type { Department } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

/**
 * El destino principal se revela dentro de la tarjeta que se endereza al hacer
 * scroll; el resto queda debajo como grilla normal.
 */
export function PopularDestinations({ destinations }: { destinations: Department[] }) {
  const list = destinations.filter((d) => (d.propertiesCount ?? 0) > 0).slice(0, 5);
  if (!list.length) return null;

  const [main, ...rest] = list;
  const mainImage =
    main.imageUrl ?? `https://picsum.photos/seed/dep-${main.slug}/1600/1000`;

  return (
    <section className="pb-20">
      <ContainerScroll
        titleComponent={
          <div className="pb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              Destinos que enamoran
            </h2>
            <p className="mt-2 text-4xl font-bold leading-none tracking-tight text-ink-900 sm:text-6xl md:text-[5rem]">
              {main.name}
            </p>
            <p className="mt-4 text-ink-600">Explora el Perú por regiones.</p>
          </div>
        }
      >
        <Link
          href={`/alojamientos?department=${main.slug}`}
          className="group relative block size-full"
        >
          <Image
            src={mainImage}
            alt={main.name}
            fill
            sizes="(max-width: 768px) 100vw, 64rem"
            priority
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="text-2xl font-semibold text-white sm:text-3xl">{main.name}</p>
            <p className="text-sm text-white/75">
              {main.propertiesCount}{' '}
              {main.propertiesCount === 1 ? 'alojamiento' : 'alojamientos'}
            </p>
          </div>
        </Link>
      </ContainerScroll>

      {rest.length > 0 && (
        <div className="container-page -mt-16 md:-mt-28">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {rest.map((destination) => (
              <Link
                key={destination.id}
                href={`/alojamientos?department=${destination.slug}`}
                className="group relative isolate aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <Image
                  src={
                    destination.imageUrl ??
                    `https://picsum.photos/seed/dep-${destination.slug}/800/600`
                  }
                  alt={destination.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-semibold text-white">{destination.name}</p>
                  <p className="text-xs text-white/75">
                    {destination.propertiesCount}{' '}
                    {destination.propertiesCount === 1 ? 'alojamiento' : 'alojamientos'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
