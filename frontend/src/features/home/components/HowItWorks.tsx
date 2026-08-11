import { CalendarCheck, MessageCircle, Search } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Busca y compara',
    description:
      'Filtra por destino, fechas, precio y comodidades. Cada alojamiento muestra fotos reales y reseñas verificadas.',
  },
  {
    icon: CalendarCheck,
    title: 'Reserva en línea',
    description:
      'Verificamos la disponibilidad en tiempo real y calculamos el total en soles antes de que confirmes.',
  },
  {
    icon: MessageCircle,
    title: 'Coordina por WhatsApp',
    description:
      'Habla directo con el anfitrión para el check-in, el traslado o cualquier pedido especial.',
  },
];

export function HowItWorks() {
  return (
    <section className="mt-24 bg-ink-50 py-16">
      <div className="container-page">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            Reservar toma menos de dos minutos
          </h2>
          <p className="mt-2 text-ink-600">Sin llamadas, sin adelantos sorpresa y sin letra chica.</p>
        </header>

        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-white text-clay-600 shadow-xs">
                  <step.icon className="size-5" />
                </span>
                <span className="text-display text-3xl text-ink-300">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
