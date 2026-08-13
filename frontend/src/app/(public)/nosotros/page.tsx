import { buildMetadata } from '@/lib/seo';
import { Button } from '@/components/ui';
import { CircularGallery } from '@/components/ui/CircularGallery';
import { Building2, Globe2, PackageCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'Nosotros',
  description:
    'Conoce PONCE & FIGUEROA GROUP S.A.C., empresa peruana dedicada a actividades inmobiliarias, envasado, empaquetado y operaciones de comercio exterior.',
  path: '/nosotros',
});

const VALUES = [
  {
    icon: Building2,
    title: 'Gestión inmobiliaria',
    description:
      'Desarrollamos actividades relacionadas con bienes inmuebles propios o arrendados, buscando generar oportunidades y soluciones dentro del sector inmobiliario.',
  },
  {
    icon: PackageCheck,
    title: 'Envasado y empaquetado',
    description:
      'Contamos con actividades orientadas al envasado y empaquetado de productos, ampliando nuestras capacidades para atender diferentes necesidades comerciales.',
  },
  {
    icon: Globe2,
    title: 'Proyección internacional',
    description:
      'Nuestra empresa cuenta con actividad de importación y exportación, permitiendo desarrollar operaciones comerciales tanto en el mercado nacional como internacional.',
  },
];
const TEAM_GALLERY = [
  {
    common: 'PONCE & FIGUEROA GROUP',
    binomial: '',
    photo: { url: '/1.jpeg', text: 'PONCE & FIGUEROA GROUP S.A.C.', by: '' },
  },
  {
    common: 'Nuestra empresa',
    binomial: '',
    photo: { url: '/2.jpeg', text: 'PONCE & FIGUEROA GROUP', by: '' },
  },
  {
    common: 'Proyección empresarial',
    binomial: '',
    photo: { url: '/3.jpeg', text: 'PONCE & FIGUEROA GROUP', by: '' },
  },
  {
    common: 'PONCE & FIGUEROA GROUP',
    binomial: '',
    photo: { url: '/4.jpeg', text: 'PONCE & FIGUEROA GROUP S.A.C.', by: '' },
  },
  {
    common: 'Nuestra empresa',
    binomial: '',
    photo: { url: '/5.jpeg', text: 'PONCE & FIGUEROA GROUP', by: '' },
  },
  {
    common: 'Proyección empresarial',
    binomial: '',
    photo: { url: '/6.jpeg', text: 'PONCE & FIGUEROA GROUP', by: '' },
  },
];
export default function AboutPage() {
  return (
    <div className="pb-12 pt-28 sm:pt-32">
      {/* HERO */}
      <section className="container-page grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-clay-700">
            PONCE & FIGUEROA GROUP S.A.C.
          </p>

          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            Construimos oportunidades,
            <span className="text-display"> conectamos mercados.</span>
          </h1>

          <p className="mt-5 leading-relaxed text-ink-700">
            PONCE & FIGUEROA GROUP S.A.C. es una empresa peruana orientada al desarrollo de actividades
            inmobiliarias, servicios de envasado y empaquetado, y operaciones de comercio exterior.
          </p>

          <p className="mt-4 leading-relaxed text-ink-700">
            Nuestro objetivo es desarrollar soluciones comerciales que generen valor, conectando oportunidades
            en el mercado peruano con una visión de crecimiento y expansión internacional.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/alojamientos">Explorar alojamientos</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contacto">Contáctanos</Link>
            </Button>
          </div>
        </div>

        <div className="relative h-[420px] w-full overflow-hidden">
          <CircularGallery items={TEAM_GALLERY} radius={260} />
        </div>
      </section>

      {/* ACTIVIDADES */}
      <section className="container-page mt-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-clay-700">Lo que hacemos</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">
            Una empresa con diferentes áreas de negocio
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">
            Contamos con diferentes líneas de actividad que nos permiten participar en distintos sectores y
            desarrollar nuevas oportunidades comerciales.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-clay-50 text-clay-700">
                <value.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold text-ink-900">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FUNDADOR */}
      <section className="container-page mt-24">
        <div className="grid items-center gap-10 rounded-3xl border border-ink-200 bg-white p-8 sm:p-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src="/1.jpeg"
              alt="Vladimir Vicente Ponce Sánchez, fundador de PONCE & FIGUEROA GROUP S.A.C."
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-clay-700">Fundador</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
              Vladimir Vicente Ponce Sánchez
            </h2>
            <p className="mt-1 text-sm font-medium text-ink-500">
              Director actual del Hospital de Emergencias Grau y Aljovín
            </p>
            <p className="mt-5 leading-relaxed text-ink-700">
              Vladimir Vicente Ponce Sánchez es el fundador de PONCE & FIGUEROA GROUP S.A.C. Actualmente se
              desempeña como director del Hospital de Emergencias Grau y Aljovín, aportando a la empresa una
              visión de liderazgo, gestión y compromiso institucional.
            </p>
          </div>
        </div>
      </section>

      {/* INFORMACIÓN CORPORATIVA */}
      <section className="container-page mt-24">
        <div className="rounded-3xl bg-ink-900 p-8 text-white sm:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">Información corporativa</p>
              <h2 className="mt-3 text-2xl font-semibold">PONCE & FIGUEROA GROUP S.A.C.</h2>
              <p className="mt-4 leading-relaxed text-white/70">
                Empresa constituida en el Perú con una visión orientada al desarrollo empresarial, la gestión
                inmobiliaria y la expansión de operaciones comerciales.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07]">
                <p className="text-xs uppercase tracking-wider text-white/50">RUC</p>
                <p className="mt-2 font-medium">20615113078</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07]">
                <p className="text-xs uppercase tracking-wider text-white/50">Constitución</p>
                <p className="mt-2 font-medium">2025</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07]">
                <p className="text-xs uppercase tracking-wider text-white/50">Tipo</p>
                <p className="mt-2 font-medium">S.A.C.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.07]">
                <p className="text-xs uppercase tracking-wider text-white/50">Comercio exterior</p>
                <p className="mt-2 font-medium">Importador / Exportador</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}