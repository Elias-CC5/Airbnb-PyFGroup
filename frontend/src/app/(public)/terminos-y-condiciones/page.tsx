import { SITE } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Términos y Condiciones',
  description: 'Reglas de uso de la plataforma, condiciones de reserva y responsabilidades.',
  path: '/terminos-y-condiciones',
  noIndex: true,
});

export default function TermsPage() {
  const updated = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container-page pb-20 pt-28 sm:pt-32">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B3A2B]">Legal</span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Términos y Condiciones
        </h1>
        <p className="mt-4 text-sm text-ink-500">Última actualización: {updated}</p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Estos Términos y Condiciones regulan el acceso y uso de https://airbnb-py-f-group.vercel.app/, operado por {SITE.legalName}
          (en adelante, &quot;{SITE.name}&quot;). Al registrarte, reservar un alojamiento o usar cualquier
          funcionalidad de la plataforma, aceptas quedar vinculado por estos términos.
        </p>
      </div>

      <div className="mt-10 max-w-3xl space-y-8 text-ink-700">
        <section>
          <h2 className="text-lg font-semibold text-ink-900">1. Naturaleza del servicio</h2>
          <p className="mt-2 leading-relaxed">
            {SITE.name} es una plataforma de intermediación tecnológica que conecta a anfitriones que ofrecen
            alojamientos en el Perú con usuarios interesados en reservarlos. {SITE.legalName} no es propietaria
            ni administradora de los alojamientos publicados; actúa únicamente como intermediario que facilita
            la publicación, búsqueda y coordinación de reservas.
          </p>
          <p className="mt-2 leading-relaxed">
            El contrato de hospedaje se celebra directamente entre el anfitrión y el huésped. {SITE.name} no es
            parte de dicho contrato y no garantiza la calidad, seguridad, legalidad ni exactitud de los
            alojamientos publicados por terceros.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">2. Registro y cuentas de usuario</h2>
          <p className="mt-2 leading-relaxed">
            Para reservar un alojamiento o publicar uno como anfitrión, debes crear una cuenta proporcionando
            información veraz y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña
            y de toda actividad realizada desde tu cuenta.
          </p>
          <p className="mt-2 leading-relaxed">
            Si te registras mediante Google o GitHub, aceptas que {SITE.name} reciba de dichos proveedores la
            información básica de tu perfil (nombre, correo, foto) necesaria para crear tu cuenta.
          </p>
          <p className="mt-2 leading-relaxed">
            Debes ser mayor de edad (18 años) para crear una cuenta y realizar reservas en la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">3. Publicación de alojamientos (anfitriones)</h2>
          <p className="mt-2 leading-relaxed">
            Los anfitriones son responsables exclusivos de la veracidad de la información, fotografías,
            precios, disponibilidad y condiciones de sus alojamientos. Al publicar un alojamiento, el anfitrión
            declara contar con la titularidad o autorización legal necesaria para ofrecerlo en alquiler.
          </p>
          <p className="mt-2 leading-relaxed">
            {SITE.name} se reserva el derecho de revisar, suspender o retirar cualquier publicación que
            incumpla estos términos, contenga información falsa o infrinja derechos de terceros.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">4. Reservas, precios y pagos</h2>
          <p className="mt-2 leading-relaxed">
            Los precios se muestran en soles (PEN) e incluyen las tarifas indicadas en cada publicación (tarifa
            por noche, tarifa de limpieza cuando aplique). Al confirmar una reserva, el usuario acepta las
            condiciones específicas del alojamiento (mínimo de noches, horarios de check-in/check-out,
            políticas del anfitrión).
          </p>
          <p className="mt-2 leading-relaxed">
            La coordinación de pago se realiza directamente entre el huésped y el anfitrión, a través de los
            medios que ambos acuerden (transferencia, efectivo u otro), salvo que la plataforma indique
            expresamente un medio de pago integrado. {SITE.name} no procesa ni custodia pagos entre las partes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">5. Cancelaciones</h2>
          <p className="mt-2 leading-relaxed">
            Las condiciones de cancelación son definidas por cada anfitrión y se muestran antes de confirmar la
            reserva. En ausencia de una política específica, se recomienda coordinar directamente con el
            anfitrión cualquier cambio o cancelación con la mayor anticipación posible.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">6. Conducta del usuario</h2>
          <p className="mt-2 leading-relaxed">Al usar la plataforma, te comprometes a no:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
            <li>Publicar información falsa, engañosa o que infrinja derechos de terceros.</li>
            <li>Usar la plataforma para fines ilícitos o fraudulentos.</li>
            <li>Intentar acceder sin autorización a cuentas de otros usuarios o a los sistemas de {SITE.name}.</li>
            <li>Copiar, reproducir o explotar comercialmente el contenido de la plataforma sin autorización.</li>
            <li>Publicar reseñas falsas o manipular las calificaciones de alojamientos.</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            El incumplimiento de estas reglas puede resultar en la suspensión o eliminación de tu cuenta.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">7. Reseñas y calificaciones</h2>
          <p className="mt-2 leading-relaxed">
            Los huéspedes pueden dejar reseñas sobre su experiencia únicamente después de haber completado una
            reserva. Las reseñas deben reflejar experiencias reales y no deben contener contenido difamatorio,
            discriminatorio o falso. {SITE.name} se reserva el derecho de retirar reseñas que incumplan esta
            regla.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">8. Propiedad intelectual</h2>
          <p className="mt-2 leading-relaxed">
            El diseño, código, marca y contenidos propios de {SITE.name} son titularidad de {SITE.legalName} y
            están protegidos por la normativa de propiedad intelectual peruana e internacional. Las fotografías
            y descripciones de los alojamientos son responsabilidad de cada anfitrión, quien garantiza contar
            con los derechos necesarios sobre dicho contenido.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">9. Limitación de responsabilidad</h2>
          <p className="mt-2 leading-relaxed">
            {SITE.legalName} no será responsable por daños, pérdidas o perjuicios derivados de: (a) la
            interacción entre huéspedes y anfitriones; (b) el estado, condiciones o legalidad de los
            alojamientos publicados por terceros; (c) interrupciones o fallas técnicas de la plataforma ajenas
            a su control razonable.
          </p>
          <p className="mt-2 leading-relaxed">
            La plataforma se ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;, sin garantías de
            funcionamiento ininterrumpido o libre de errores.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">10. Protección al consumidor</h2>
          <p className="mt-2 leading-relaxed">
            Como usuario, tienes derecho a presentar reclamos o quejas a través de nuestro{' '}
            <a href="/libro-reclamaciones" className="font-medium text-[#8B3A2B] hover:underline">
              Libro de Reclamaciones
            </a>
            , conforme al Código de Protección y Defensa del Consumidor. La formulación de un reclamo no impide
            acudir a otras vías de solución de controversias ni es requisito previo para denunciar ante el
            INDECOPI.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">11. Modificaciones</h2>
          <p className="mt-2 leading-relaxed">
            {SITE.name} puede modificar estos Términos y Condiciones en cualquier momento. Los cambios entran
            en vigencia desde su publicación en esta página. El uso continuado de la plataforma después de una
            modificación implica la aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">12. Legislación aplicable</h2>
          <p className="mt-2 leading-relaxed">
            Estos términos se rigen por la legislación peruana. Cualquier controversia derivada de su
            interpretación o cumplimiento se somete a los jueces y tribunales del distrito judicial de Lima,
            Perú, sin perjuicio de los derechos que la normativa de protección al consumidor reconoce a los
            usuarios.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">13. Contacto</h2>
          <p className="mt-2 leading-relaxed">
            Para consultas sobre estos Términos y Condiciones, escríbenos a{' '}
            <a href={`mailto:${SITE.legalEmail}`} className="font-medium text-[#8B3A2B] hover:underline">
              {SITE.legalEmail}
            </a>{' '}
            o al {SITE.phone}.
          </p>
        </section>
      </div>
    </div>
  );
}