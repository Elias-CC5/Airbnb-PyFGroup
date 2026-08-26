import { SITE } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Términos y Condiciones y Aviso legal',
  description:
    'Titularidad del sitio, objeto de los servicios, propiedad intelectual, limitación de responsabilidad y jurisdicción aplicable.',
  path: '/terminos-y-condiciones',
  noIndex: true,
});

/** Actividades del objeto social, tal como figuran en el aviso legal. */
const SERVICIOS = [
  {
    titulo: 'Gestión Inmobiliaria',
    detalle:
      'Compra, venta, administración y arrendamiento de bienes inmuebles, incluyendo la gestión de alquileres temporales tipo «Airbnb» y property management.',
  },
  {
    titulo: 'Servicios de Salud',
    detalle:
      'Prestación de servicios médicos generales y especializados, enfermería, salud ocupacional, telemedicina y campañas de prevención.',
  },
  {
    titulo: 'Eventos y Alimentación',
    detalle:
      'Organización integral de eventos corporativos y sociales, así como servicios de catering, coffee breaks, comedores y dark kitchens.',
  },
  {
    titulo: 'Logística',
    detalle: 'Servicios de empaquetado, etiquetado, armado de kits, almacenamiento y logística liviana.',
  },
  {
    titulo: 'Consultoría y Mantenimiento',
    detalle:
      'Asesoría especializada en ingeniería y gestión, así como servicios generales de mantenimiento, limpieza y saneamiento ambiental.',
  },
  {
    titulo: 'Educación y Comercio',
    detalle:
      'Servicios de capacitación y docencia, así como la importación y comercialización de bienes, equipos e insumos médicos y tecnológicos relacionados con nuestras actividades.',
  },
] as const;

export default function TermsPage() {
  const updated = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container-page pb-20 pt-28 sm:pt-32">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B3A2B]">Legal</span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Términos y Condiciones y Aviso legal
        </h1>
        <p className="mt-4 text-sm text-ink-500">Última actualización: {updated}</p>
      </div>

      <div className="mt-10 max-w-3xl space-y-8 text-ink-700">
        <section>
          <h2 className="text-lg font-semibold text-ink-900">1. Datos identificativos</h2>
          <p className="mt-2 leading-relaxed">
            En cumplimiento con el deber de información, se señala que la titularidad de este sitio web
            corresponde a la empresa <strong>PONCE &amp; FIGUEROA GROUP S.A.C.</strong> (también denominada
            PONFIG S.A.C.), inscrita en la Partida Registral N.° 16060669 del Registro de Personas Jurídicas
            de la Zona Registral N.° IX — Sede Lima. La empresa tiene su domicilio legal en la ciudad de Lima,
            Departamento de Lima, Perú.
          </p>
          <p className="mt-2 leading-relaxed">
            Puede contactarnos al correo electrónico{' '}
            <a
              href={`mailto:${SITE.legalEmail}`}
              className="font-medium text-ink-900 underline underline-offset-4 hover:text-ink-700"
            >
              {SITE.legalEmail}
            </a>{' '}
            o en la dirección física: Av. Arequipa 768, Urbanización Lima-Santa Beatriz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">2. Objeto y ámbito de los servicios</h2>
          <p className="mt-2 leading-relaxed">
            La presente página web tiene por objeto ofrecer información y acceso a los servicios comerciales
            descritos en nuestro objeto social, los cuales incluyen pero no se limitan a:
          </p>

          {/*
            Lista descriptiva en vez de viñetas: cada actividad lleva su propio
            desarrollo, y con `<li>` sueltos el bloque se lee como un muro.
          */}
          <dl className="mt-4 space-y-4">
            {SERVICIOS.map((servicio) => (
              <div key={servicio.titulo} className="border-l-2 border-ink-200 pl-4">
                <dt className="font-medium text-ink-900">{servicio.titulo}</dt>
                <dd className="mt-1 leading-relaxed">{servicio.detalle}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">3. Propiedad intelectual</h2>
          <p className="mt-2 leading-relaxed">
            Todos los contenidos de este sitio web (textos, logotipos, imágenes y diseño) son propiedad de
            PONCE &amp; FIGUEROA GROUP S.A.C. o de terceros que han autorizado su uso. Queda prohibida su
            reproducción total o parcial sin consentimiento expreso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">4. Limitación de responsabilidad</h2>
          <p className="mt-2 leading-relaxed">
            PONFIG S.A.C. se esfuerza por mantener la información de esta web actualizada. Sin embargo, en el
            caso de los servicios médicos o de consultoría descritos, la información aquí contenida es de
            carácter referencial y no sustituye el asesoramiento profesional directo.
          </p>
          <p className="mt-2 leading-relaxed">
            Para los servicios inmobiliarios y de eventos, las cotizaciones y disponibilidad están sujetas a
            confirmación final mediante contrato.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">5. Legislación aplicable y jurisdicción</h2>
          <p className="mt-2 leading-relaxed">
            Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o
            de las actividades en él desarrolladas, será de aplicación la legislación peruana, sometiéndose las
            partes a los Juzgados y Tribunales de la ciudad de Lima, renunciando expresamente a cualquier otro
            fuero, dado que el domicilio de la sociedad se encuentra registrado en dicha provincia.
          </p>
        </section>
      </div>
    </div>
  );
}
