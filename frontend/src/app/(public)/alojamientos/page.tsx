import { PropertyGridSkeleton } from '@/components/ui';
import { ScrollFlyIn } from '@/components/ui/hero-section-3';
import { PropertiesResults } from '@/features/properties/components/PropertiesResults';
import { buildMetadata } from '@/lib/seo';
import { Suspense } from 'react';

export const metadata = buildMetadata({
  title: 'Alojamientos en alquiler en Perú',
  description:
    'Explora casas, departamentos, cabañas y villas disponibles en todo el Perú. Filtra por destino, fechas, precio y comodidades.',
  path: '/alojamientos',
});

export default function PropertiesPage() {
  return (
    <>
      {/*
        Hero más corto que en Destinos: esta es una página de búsqueda y los
        filtros no pueden quedar a dos pantallas de distancia.
      */}
      <ScrollFlyIn
        className="h-[130vh]"
        scrollToId="resultados"
        scrollLabel="Ver alojamientos"
      >
        <div className="mx-auto max-w-3xl px-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-400">Alojamientos</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl md:text-6xl">
            <span className="text-display">Tu lugar en el Perú,</span> listo para llegar
          </h1>
          <p className="mt-4 text-ink-600">
            Casas, departamentos y cabañas verificadas. Filtra por destino, fechas y precio.
          </p>
        </div>
      </ScrollFlyIn>

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
