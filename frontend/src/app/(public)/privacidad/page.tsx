import { SITE } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Política de Privacidad',
  description: 'Cómo recolectamos, usamos y protegemos tus datos personales.',
  path: '/privacidad',
  noIndex: true,
});

export default function PrivacyPolicyPage() {
  const updated = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container-page pb-20 pt-28 sm:pt-32">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B3A2B]">Legal</span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Política de Privacidad
        </h1>
        <p className="mt-4 text-sm text-ink-500">Última actualización: {updated}</p>
        <p className="mt-4 leading-relaxed text-ink-600">
          En {SITE.legalName} (en adelante, &quot;{SITE.name}&quot;) valoramos tu privacidad. Esta política
          explica qué datos personales recolectamos, con qué finalidad y qué derechos tienes sobre ellos,
          conforme a la Ley N° 29733, Ley de Protección de Datos Personales, y su reglamento.
        </p>
      </div>

      <div className="mt-10 max-w-3xl space-y-8 text-ink-700">
        <section>
          <h2 className="text-lg font-semibold text-ink-900">1. Responsable del tratamiento</h2>
          <p className="mt-2 leading-relaxed">
            {SITE.legalName}, con RUC {SITE.ruc} y domicilio en {SITE.fiscalAddress}, es responsable del
            tratamiento de los datos personales recolectados a través de {SITE.url}. Para cualquier consulta
            sobre esta política, puedes escribirnos a{' '}
            <a href={`mailto:${SITE.legalEmail}`} className="font-medium text-[#8B3A2B] hover:underline">
              {SITE.legalEmail}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">2. Datos que recolectamos</h2>
          <p className="mt-2 leading-relaxed">Según cómo uses la plataforma, podemos recolectar:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
            <li><strong>Datos de registro:</strong> nombre, apellidos, correo electrónico, teléfono (opcional) y contraseña (encriptada).</li>
            <li><strong>Datos de autenticación social:</strong> si inicias sesión con Google o GitHub, recibimos tu nombre, correo y foto de perfil según lo autorices en dicho proveedor.</li>
            <li><strong>Datos de reservas:</strong> fechas, número de huéspedes, alojamiento reservado e historial de reservas.</li>
            <li><strong>Datos de contacto:</strong> los que ingreses en el formulario de contacto o en el Libro de Reclamaciones (nombre, documento de identidad, domicilio, correo, teléfono).</li>
            <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador y cookies de sesión, con fines de seguridad y funcionamiento del sitio.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">3. Finalidad del tratamiento</h2>
          <p className="mt-2 leading-relaxed">Usamos tus datos personales para:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
            <li>Crear y administrar tu cuenta de usuario.</li>
            <li>Gestionar reservas y comunicarte con el anfitrión correspondiente.</li>
            <li>Atender consultas, reclamos y quejas.</li>
            <li>Enviarte notificaciones relacionadas con tu cuenta o tus reservas.</li>
            <li>Mejorar la seguridad y el funcionamiento de la plataforma.</li>
            <li>Cumplir con obligaciones legales, incluyendo las derivadas del Código de Protección y Defensa del Consumidor.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">4. Base legal y consentimiento</h2>
          <p className="mt-2 leading-relaxed">
            El tratamiento de tus datos se basa en el consentimiento que otorgas al registrarte, al usar el
            inicio de sesión con Google o GitHub, o al completar cualquier formulario de la plataforma. Puedes
            retirar tu consentimiento en cualquier momento, sin que ello afecte la licitud del tratamiento
            realizado con anterioridad.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">5. Con quién compartimos tus datos</h2>
          <p className="mt-2 leading-relaxed">
            No vendemos ni cedemos tus datos personales a terceros con fines comerciales. Podemos compartir
            información estrictamente necesaria con:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
            <li>El anfitrión de un alojamiento, para coordinar tu reserva.</li>
            <li>Proveedores tecnológicos que nos brindan servicios de hosting, almacenamiento o autenticación (por ejemplo, Google, GitHub), bajo sus propias políticas de privacidad.</li>
            <li>Autoridades competentes, cuando exista una obligación legal de hacerlo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">6. Tiempo de conservación</h2>
          <p className="mt-2 leading-relaxed">
            Conservamos tus datos mientras mantengas una cuenta activa en la plataforma. Si solicitas la
            eliminación de tu cuenta, eliminaremos o anonimizaremos tus datos personales, salvo aquellos que
            debamos conservar por obligación legal (por ejemplo, registros de reclamos, según la normativa de
            protección al consumidor).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">7. Tus derechos (ARCO)</h2>
          <p className="mt-2 leading-relaxed">
            Como titular de tus datos personales, tienes derecho a:
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
            <li><strong>Acceso:</strong> conocer qué datos tuyos tenemos y cómo los usamos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos cuando ya no sean necesarios.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en determinados supuestos.</li>
          </ul>
          <p className="mt-3 leading-relaxed">
            Puedes ejercer estos derechos escribiendo a{' '}
            <a href={`mailto:${SITE.legalEmail}`} className="font-medium text-[#8B3A2B] hover:underline">
              {SITE.legalEmail}
            </a>{' '}
            indicando tu nombre completo, el derecho que deseas ejercer y adjuntando copia de tu documento de
            identidad. Responderemos dentro del plazo establecido por la Autoridad Nacional de Protección de
            Datos Personales.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">8. Seguridad</h2>
          <p className="mt-2 leading-relaxed">
            Aplicamos medidas técnicas y organizativas razonables para proteger tus datos personales contra
            acceso no autorizado, pérdida o alteración, incluyendo el cifrado de contraseñas y el uso de
            conexiones seguras (HTTPS).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink-900">9. Cambios a esta política</h2>
          <p className="mt-2 leading-relaxed">
            Podemos actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas o en la
            normativa aplicable. La fecha de la última actualización se indica al inicio de este documento.
          </p>
        </section>
      </div>
    </div>
  );
}