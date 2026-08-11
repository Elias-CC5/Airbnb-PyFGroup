import { catalogServerService } from '@/features/properties/services/catalog.service';
import { buildMetadata } from '@/lib/seo';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 600;

export const metadata = buildMetadata({
  title: 'Destinos en Perú',
  description: 'Descubre alojamientos en Cusco, Lima, Arequipa, Ica, Piura y todo el Perú.',
  path: '/destinos',
});

export default async function DestinationsPage() {
  const departments = (await catalogServerService.departments()) ?? [];

  return (
    <div className="container-page py-12">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          <span className="text-display">Todo el Perú,</span> un destino a la vez
        </h1>
        <p className="mt-3 text-ink-600">
          Desde la costa hasta la selva, elige tu región y encuentra dónde quedarte.
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Link
            key={department.id}
            href={`/alojamientos?department=${department.slug}`}
            className="group relative aspect-[3/2] overflow-hidden rounded-2xl"
          >
            <Image
              src={department.imageUrl ?? `https://picsum.photos/seed/dep-${department.slug}/800/600`}
              alt={department.name}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-lg font-semibold text-white">{department.name}</p>
              <p className="text-xs text-white/75">
                {department.propertiesCount ?? 0} alojamientos disponibles
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
