import { catalogServerService } from '@/features/properties/services/catalog.service';
import { getDepartmentImages } from '@/lib/department-images';
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
  const images = await getDepartmentImages(departments);

  return (
    <div className="pb-12">
      {/*
        Sin hero: las fotos de las regiones son el contenido de esta página, y
        una portada encima sólo las empujaba fuera de la primera pantalla.
      */}
      {/* `pt-28` es la convención del proyecto para páginas sin hero: el Navbar
          va `fixed` y sin ese margen el título le queda debajo. */}
      <header className="container-page pb-6 pt-28 sm:pt-32">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Destinos</h1>
        <p className="mt-2 max-w-xl text-ink-600">
          Desde la costa hasta la selva. Elige tu región y mira dónde quedarte.
        </p>
      </header>

      <div id="destinos-grid" className="container-page scroll-mt-28">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <Link
              key={department.id}
              href={`/alojamientos?department=${department.slug}`}
              className="group relative aspect-[3/2] overflow-hidden rounded-2xl"
            >
              <Image
                src={images[department.slug]}
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
    </div>
  );
}
