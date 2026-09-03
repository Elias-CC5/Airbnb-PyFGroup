import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Sin conexión',
  description: 'No hay conexión a internet.',
  path: '/sin-conexion',
  noIndex: true,
});

/**
 * Lo que se ve cuando el teléfono se queda sin datos.
 *
 * El service worker la guarda al instalarse, así que está disponible aunque no
 * haya red. Va sin imágenes ni llamadas a la API a propósito: todo lo que
 * necesite descargarse fallaría justo aquí.
 */
export default function SinConexionPage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center pb-20 pt-28 text-center sm:pt-32">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
        Sin conexión
      </span>

      <h1 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        Parece que te quedaste sin internet
      </h1>

      <p className="mt-4 max-w-md leading-relaxed text-ink-600">
        No pudimos cargar esta página. Revisa tu conexión y vuelve a intentarlo; las páginas que ya
        visitaste siguen disponibles.
      </p>

      <p className="mt-8 text-sm text-ink-500">
        ¿Necesitas ayuda con una reserva? Escríbenos al{' '}
        <a href="tel:+51974467762" className="font-medium text-ink-900 underline underline-offset-4">
          +51 974 467 762
        </a>
        .
      </p>
    </div>
  );
}
