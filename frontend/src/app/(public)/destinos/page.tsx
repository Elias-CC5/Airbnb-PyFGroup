import { ScrollFlyIn } from '@/components/ui/hero-section-3';
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
      {/* El avión cruza la pantalla mientras se hace scroll. */}
      <ScrollFlyIn scrollToId="destinos-grid" scrollLabel="Ver destinos">
        <div className="mx-auto max-w-3xl px-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-400">Destinos</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl md:text-6xl">
            <span className="text-display">Todo el Perú,</span> un destino a la vez
          </h1>
          <p className="mt-4 text-ink-600">
            Desde la costa hasta la selva, elige tu región y encuentra dónde quedarte.
          </p>
        </div>
      </ScrollFlyIn>

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
