import { DiagonalMarquee, type MarqueeCard } from '@/components/ui/DiagonalMarquee';
import type { Department } from '@/types';

const TRUST = [
  { value: '1.200+', label: 'huéspedes hospedados' },
  { value: '4,9', label: 'calificación promedio' },
  { value: '10', label: 'regiones del Perú' },
];

/** Respaldo: si la API aún no responde, el hero no se queda en blanco. */
const FALLBACK_CARDS: MarqueeCard[] = [
  'Cusco',
  'Lima',
  'Arequipa',
  'Ica',
  'Piura',
  'Puno',
  'Áncash',
  'Loreto',
].map((name, index) => ({
  id: index,
  url: `https://picsum.photos/seed/wasi-${name.toLowerCase()}/680/480`,
  title: name,
}));

export function Hero({ destinations = [] }: { destinations?: Department[] }) {
  const cards: MarqueeCard[] = destinations.length
    ? destinations.map((department) => ({
        id: department.id,
        url: department.imageUrl ?? `https://picsum.photos/seed/dep-${department.slug}/680/480`,
        title: department.name,
      }))
    : FALLBACK_CARDS;

  return (
    <section className="relative z-20 -mt-[88px] flex min-h-[760px] items-center overflow-hidden pb-16 pt-32 lg:h-[96vh]">
      <div className="absolute inset-0">
        <DiagonalMarquee cards={cards} angle={-22} baseSpeed={130} />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.75)_45%,transparent_75%)]" />

      <div className="container-page relative w-full text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay-700">
          Alojamientos con alma peruana
        </p>

        <h1 className="mx-auto mt-5 max-w-4xl text-[2.75rem] leading-[0.98] tracking-tight text-ink-950 sm:text-6xl lg:text-[4.5rem]">
          <span className="text-display block font-normal">Donde quieras ir</span>
          <span className="block font-semibold">en el Perú, hay un wasi.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
          Casas, departamentos y cabañas verificadas una por una. Reserva en línea, paga en soles y
          coordina directo con el anfitrión.
        </p>

        <div className="mx-auto mt-10 max-w-4xl">
        </div>

        <dl className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-4">
          {TRUST.map((item) => (
            <div key={item.label}>
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block text-2xl font-semibold text-ink-900">{item.value}</span>
                <span className="text-xs uppercase tracking-wider text-ink-500">{item.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}