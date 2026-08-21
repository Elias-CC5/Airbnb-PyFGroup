import { PropertyGridSkeleton } from '@/components/ui';
import { PropertiesResults } from '@/features/properties/components/PropertiesResults';
import { catalogServerService } from '@/features/properties/services/catalog.service';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Suspense } from 'react';

export const revalidate = 600;

export const metadata = buildMetadata({
  title: 'Alojamientos en alquiler en Perú',
  description:
    'Explora casas, departamentos, cabañas y villas disponibles en todo el Perú. Filtra por destino, fechas, precio y comodidades.',
  path: '/alojamientos',
});

export default async function PropertiesPage() {
  // Atajos a las categorías con stock, para entrar ya filtrado.
  const categories = (await catalogServerService.categories()) ?? [];
  const shortcuts = categories
    .map((c) => ({ ...c, count: c._count?.properties ?? 0 }))
    .filter((c) => c.count > 0)
    .slice(0, 5);

  return (
    <>
      {/*
        Sin hero: esta es una página de búsqueda y los filtros no pueden quedar
        a una pantalla de distancia. Queda sólo el encabezado, que además
        sostiene el <h1> que la página necesita.
      */}
      <header className="container-page pb-2 pt-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Alojamientos</h1>
        <p className="mt-2 max-w-xl text-ink-600">
          Casas, departamentos y cabañas verificadas. Filtra por destino, fechas y precio.
        </p>

        {shortcuts.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {shortcuts.map((category) => (
              <Link
                key={category.id}
                href={`/alojamientos?category=${category.slug}#resultados`}
                className="rounded-full border border-ink-300 px-4 py-1.5 text-sm text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
              >
                {category.name}
                <span className="ml-1.5 text-ink-400">{category.count}</span>
              </Link>
            ))}
          </div>
        )}
      </header>

      <div id="resultados" className="scroll-mt-28">
        <Suspense
          fallback={
            <div className="container-page py-10">
              <PropertyGridSkeleton />
            </div>
          }
        >
          <PropertiesResults />
        </Suspense>
      </div>
    </>
  );
}
