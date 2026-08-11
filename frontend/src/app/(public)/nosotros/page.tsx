import { buildMetadata } from '@/lib/seo';
import { Button } from '@/components/ui';
import { Heart, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Nosotros',
  description: 'Airbnb PyFGroup conecta viajeros con anfitriones peruanos. Conoce cómo trabajamos.',
  path: '/nosotros',
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Transparencia total',
    description: 'El precio que ves es el precio final, en soles y sin cargos ocultos.',
  },
  {
    icon: Heart,
    title: 'Anfitriones locales',
    description: 'Cada alojamiento pertenece a familias y emprendedores peruanos.',
  },
  {
    icon: Sparkles,
    title: 'Curaduría real',
    description: 'Revisamos fotos, ubicación y comodidades antes de publicar un espacio.',
  },
];

export default function AboutPage() {
  return (
    <div className="container-page py-12">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-4xl">
            <span className="text-display">Wasi</span> significa casa en quechua.
          </h1>
          <p className="mt-5 leading-relaxed text-ink-700">
            Nacimos con una idea sencilla: que encontrar dónde quedarte en el Perú sea tan fácil como
            preguntarle a un amigo que conoce el lugar. Trabajamos directamente con anfitriones locales para
            que cada estadía tenga algo del carácter de la región que visitas.
          </p>
          <p className="mt-4 leading-relaxed text-ink-700">
            Hoy tenemos alojamientos en la costa, la sierra y la selva, y seguimos sumando destinos con el mismo
            criterio: espacios cuidados, anfitriones que responden y precios claros en soles.
          </p>
          <Button asChild className="mt-8">
            <Link href="/alojamientos">Explorar alojamientos</Link>
          </Button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="https://picsum.photos/seed/wasi-about/900/700"
            alt="Interior de una casa peruana"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-2xl border border-ink-200 p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-clay-50 text-clay-700">
              <value.icon className="size-5" />
            </span>
            <h2 className="mt-4 font-semibold text-ink-900">{value.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{value.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
