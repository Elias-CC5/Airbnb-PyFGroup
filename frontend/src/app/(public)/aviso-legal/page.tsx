import { SITE } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Aviso Legal',
  description: 'Información legal e identificación del titular de este sitio web.',
  path: '/aviso-legal',
  noIndex: true,
});

export default function LegalNoticePage() {
  return (
    <div className="container-page pb-20 pt-28 sm:pt-32">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B3A2B]">Legal</span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">Aviso Legal</h1>
        <p className="mt-4 text-sm text-ink-500">Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="mt-10 max-w-3xl space-y-8 text-ink-700">
        <section>
          <h2 className="text-lg font-semibold text-ink-900">1. Datos identificativos</h2>
          <p className="mt-2 leading-relaxed">
            En cumplimiento con el deber de información, se ponen a disposición de los usuarios los siguientes
            datos del titular de este sitio web:
          </p>
          <dl className="mt-4 space-y-2 rounded-2xl border border-ink-200 bg-white p-5 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-900 sm:w-40 sm:shrink-0">Razón social</dt>
              <dd>{SITE.legalName}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-900 sm:w-40 sm:shrink-0">RUC</dt>
              <dd>{SITE.ruc}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-900 sm:w-40 sm:shrink-0">Domicilio fiscal</dt>
              <dd>{SITE.fiscalAddress}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-900 sm:w-40 sm:shrink-0">Correo de contacto</dt>
              <dd>{SITE.legalEmail}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-900 sm:w-40 sm:shrink-0">Teléfono</dt>
              <dd>{SITE.phone}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">2. Objeto</h2>
          <p className="mt-2 leading-relaxed">
            El presente sitio web ({SITE.url}) tiene como finalidad ofrecer una plataforma de intermediación
            entre anfitriones que publican alojamientos y usuarios interesados en reservarlos dentro del
            territorio peruano. {SITE.legalName} actúa como intermediario tecnológico; la relación contractual
            de hospedaje se establece directamente entre el anfitrión y el huésped.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">3. Condiciones de acceso y uso</h2>
          <p className="mt-2 leading-relaxed">
            El acceso a este sitio web es gratuito, salvo el costo de conexión a internet del usuario. El
            simple acceso implica la aceptación de este Aviso Legal, de los Términos y Condiciones y de la
            Política de Privacidad. El usuario se compromete a hacer un uso adecuado de los contenidos y
            servicios ofrecidos, y a no emplearlos para actividades ilícitas, lesivas de derechos de terceros,
            o que de cualquier forma dañen, inutilicen o deterioren el sitio web.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">4. Propiedad intelectual</h2>
          <p className="mt-2 leading-relaxed">
            El diseño del sitio web, código fuente, logotipos, marcas, textos e imágenes propias son
            titularidad de {SITE.legalName} o de sus licenciantes, y están protegidos por las normas
            nacionales e internacionales de propiedad intelectual. Queda prohibida su reproducción,
            distribución o comunicación pública total o parcial sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">5. Exclusión de responsabilidad</h2>
          <p className="mt-2 leading-relaxed">
            {SITE.legalName} no garantiza la disponibilidad, continuidad o infalibilidad del funcionamiento del
            sitio web, ni la ausencia de errores. Tampoco se responsabiliza por el contenido publicado por los
            anfitriones respecto de sus alojamientos, siendo estos los únicos responsables de la veracidad de
            la información que suministran.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">6. Legislación aplicable</h2>
          <p className="mt-2 leading-relaxed">
            Las presentes condiciones se rigen por la legislación peruana. Para cualquier controversia derivada
            del acceso o uso de este sitio web, las partes se someten a los jueces y tribunales del distrito
            judicial de Lima, Perú, salvo disposición legal en contrario.
          </p>
        </section>
      </div>
    </div>
  );
}