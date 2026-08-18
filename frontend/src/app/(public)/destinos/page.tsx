import { ScrollFlyIn } from '@/components/ui/hero-section-3';
import { catalogServerService } from '@/features/properties/services/catalog.service';
import { getDepartmentImages } from '@/lib/department-images';
import { buildMetadata } from '@/lib/seo';
import { MapPin, ShieldCheck, Sparkles } from 'lucide-react';
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

  const totalStays = departments.reduce((acc, d) => acc + (d.propertiesCount ?? 0), 0);
  const activeRegions = departments.filter((d) => (d.propertiesCount ?? 0) > 0).length;

  return (
    <div className="pb-12">
      {/* El avión cruza la pantalla mientras se hace scroll. */}
      <ScrollFlyIn scrollToId="destinos-grid" scrollLabel="Ver destinos">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">Destinos</p>

          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl md:text-6xl">
            Todo el Perú,
            <br />
            un destino a la vez
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-ink-600">
            Desde la costa hasta la selva, elige tu región y encuentra dónde quedarte. Coordinas
            directo con el anfitrión, sin intermediarios.
          </p>

          {/* Cifras reales, tomadas del catálogo */}
          <dl className="mx-auto mt-10 grid max-w-lg grid-cols-3 divide-x divide-ink-200 border-y border-ink-200 py-5">
            <div className="px-3">
              <dt className="text-xs text-ink-500">Regiones</dt>
              <dd className="mt-1 text-2xl font-bold text-ink-900">{departments.length}</dd>
            </div>
            <div className="px-3">
              <dt className="text-xs text-ink-500">Con alojamientos</dt>
              <dd className="mt-1 text-2xl font-bold text-ink-900">{activeRegions}</dd>
            </div>
            <div className="px-3">
              <dt className="text-xs text-ink-500">Estadías</dt>
              <dd className="mt-1 text-2xl font-bold text-ink-900">{totalStays}</dd>
            </div>
          </dl>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-600">
            <li className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-ink-400" /> Ubicación exacta en el mapa
            </li>
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-ink-400" /> Cancelación flexible
            </li>
            <li className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-ink-400" /> Sin comisiones ocultas
            </li>
          </ul>
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
