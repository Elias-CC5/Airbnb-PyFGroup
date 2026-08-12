import { ContactForm } from '@/features/home/components/ContactForm';
import { SITE } from '@/constants';
import { buildMetadata } from '@/lib/seo';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

export const metadata = buildMetadata({
  title: 'Contacto',
  description: 'Escríbenos por WhatsApp o correo. Respondemos en menos de 24 horas.',
  path: '/contacto',
});

export default function ContactPage() {
  return (
    <div className="container-page pt-28 pb-12 sm:pt-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            <span className="text-display">Hablemos</span>
          </h1>
          <p className="mt-4 leading-relaxed text-ink-600">
            ¿Dudas sobre una reserva, quieres publicar tu alojamiento o necesitas ayuda? Estamos disponibles de
            lunes a domingo.
          </p>

          <ul className="mt-8 space-y-4">
            <li>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-ink-200 p-4 transition hover:border-ink-400"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#25D366]/10 text-[#128C7E]">
                  <MessageCircle className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink-900">WhatsApp</span>
                  <span className="block text-sm text-ink-500">Respuesta en minutos</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-start gap-4 rounded-2xl border border-ink-200 p-4 transition hover:border-ink-400"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-clay-50 text-clay-700">
                  <Mail className="size-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink-900">{SITE.email}</span>
                  <span className="block text-sm text-ink-500">Respondemos en 24 horas</span>
                </span>
              </a>
            </li>
            <li className="flex items-start gap-4 rounded-2xl border border-ink-200 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-700">
                <MapPin className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-medium text-ink-900">Lima, Perú</span>
                <span className="block text-sm text-ink-500">Operamos en todo el país</span>
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}