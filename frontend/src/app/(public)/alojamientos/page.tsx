import { PropertyGridSkeleton } from '@/components/ui';
import { ScrollFlyIn } from '@/components/ui/hero-section-3';
import { PropertiesResults } from '@/features/properties/components/PropertiesResults';
import { catalogServerService } from '@/features/properties/services/catalog.service';
import { buildMetadata } from '@/lib/seo';
import { CalendarCheck, MessageCircle, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const revalidate = 600;

export const metadata = buildMetadata({
  title: 'Alojamientos en alquiler en Perú',
  description:
    'Explora casas, departamentos, cabañas y villas disponibles en todo el Perú. Filtra por destino, fechas, precio y comodidades.',
  path: '/alojamientos',
});

const PERKS = [
  { icon: Wallet, label: 'Sin comisiones ocultas' },
  { icon: MessageCircle, label: 'Coordinas por WhatsApp' },
  { icon: CalendarCheck, label: 'Cancelación flexible' },
];

export default async function PropertiesPage() {
  // Atajos a las categorías con stock, para entrar filtrado desde el hero.
  const categories = (await catalogServerService.categories()) ?? [];
  const shortcuts = categories
    .map((c) => ({ ...c, count: c._count?.properties ?? 0 }))
    .filter((c) => c.count > 0)
    .slice(0, 5);

  return (
    <>
      {/*
        Hero más corto que en Destinos: esta es una página de búsqueda y los
        filtros no pueden quedar a dos pantallas de distancia.
      */}
      <ScrollFlyIn className="h-[140vh]" scrollToId="resultados" scrollLabel="Ver alojamientos">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
            Alojamientos
          </p>

          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl md:text-6xl">
            Tu lugar en el Perú,
            <br />
            listo para llegar
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-ink-600">
            Casas, departamentos y cabañas verificadas. Filtra por destino, fechas y precio, y
            reserva coordinando directo con el anfitrión.
          </p>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-ink-600">
            {PERKS.map((perk) => (
              <li key={perk.label} className="inline-flex items-center gap-2">
                <perk.icon className="size-4 text-ink-400" />
                {perk.label}
              </li>
            ))}
          </ul>

          {shortcuts.length > 0 && (
            <div className="mt-8 border-t border-ink-200 pt-6">
              <p className="text-xs text-ink-400">Ir directo a</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
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
            </div>
          )}
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
