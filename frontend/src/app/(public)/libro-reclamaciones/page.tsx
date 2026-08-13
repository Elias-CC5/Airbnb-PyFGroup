import { ComplaintForm } from '@/features/complaints/components/ComplaintForm';
import { SITE } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Libro de Reclamaciones',
  description: 'Registra tu reclamo o queja. Conforme al Código de Protección y Defensa del Consumidor.',
  path: '/libro-reclamaciones',
});

export default function ComplaintBookPage() {
  return (
    <div className="container-page pb-20 pt-28 sm:pt-32">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B3A2B]">
          Atención al consumidor
        </span>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Libro de Reclamaciones
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600">
          Este establecimiento cuenta con un Libro de Reclamaciones a tu disposición. Aquí puedes registrar tu
          reclamo o queja de manera virtual, conforme a lo dispuesto por el Código de Protección y Defensa del
          Consumidor.
        </p>
      </div>

      <div className="mt-10 max-w-3xl rounded-3xl border border-ink-200 bg-white p-7 sm:p-9">
        <ComplaintForm />
      </div>

      <p className="mt-6 max-w-2xl text-xs text-ink-400">
        {SITE.legalName} · RUC {SITE.ruc}
      </p>
    </div>
  );
}