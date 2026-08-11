import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  place: string;
  avatar: string;
}

const AVATAR = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=150&h=150`;

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Reservamos una casa en el Valle Sagrado y todo fue tal cual las fotos. El anfitrión nos escribió por WhatsApp el mismo día.',
    author: 'Lucía Fernández',
    place: 'Viaje a Cusco',
    avatar: AVATAR('1494790108377-be9c29b29330'),
  },
  {
    quote:
      'Me encantó poder filtrar por fechas y ver solo lo realmente disponible. Nos ahorró un montón de mensajes.',
    author: 'Diego Ramos',
    place: 'Escapada a Paracas',
    avatar: AVATAR('1472099645785-5658abf4ff4e'),
  },
  {
    quote:
      'Precios en soles, sin conversiones raras. Reservé en la noche y al día siguiente ya estaba confirmada.',
    author: 'Valeria Chávez',
    place: 'Fin de semana en Máncora',
    avatar: AVATAR('1438761681033-6461ffad8d80'),
  },
  {
    quote:
      'Viajamos con mis papás y necesitábamos algo accesible. La descripción era clarísima y no hubo sorpresas al llegar.',
    author: 'Andrés Quispe',
    place: 'Estadía en Arequipa',
    avatar: AVATAR('1507003211169-0a1dd7228f2d'),
  },
  {
    quote:
      'La cabaña en Huaraz tenía chimenea y agua caliente de verdad, que en la sierra no es poca cosa. Repetiríamos sin dudar.',
    author: 'Camila Rojas',
    place: 'Trekking en Áncash',
    avatar: AVATAR('1534528741775-53994a69daeb'),
  },
  {
    quote:
      'Cancelé con dos semanas de anticipación y el proceso fue transparente, sin llamadas ni letra chica.',
    author: 'Aliza Núñez',
    place: 'Reserva en Ica',
    avatar: AVATAR('1517841905240-472988babdf9'),
  },
  {
    quote:
      'Buscaba algo para el equipo de la oficina y encontré una casa para diez personas a media hora de Lima.',
    author: 'Fernando Silva',
    place: 'Escapada a Asia',
    avatar: AVATAR('1500648767791-00dcc994a43e'),
  },
  {
    quote:
      'El lodge en la selva superó lo que esperábamos. Coordinar el traslado por WhatsApp fue lo más fácil del viaje.',
    author: 'Sandra Shapiama',
    place: 'Viaje a Iquitos',
    avatar: AVATAR('1544005313-94ddf0286df2'),
  },
  {
    quote:
      'Soy anfitriona y publicar mi departamento fue directo. Las reservas empezaron a llegar la primera semana.',
    author: 'Hassan Alí',
    place: 'Anfitrión en Miraflores',
    avatar: AVATAR('1506794778202-cad84cf45f1d'),
  },
];

const COLUMNS = [
  { items: TESTIMONIALS.slice(0, 3), duration: 34, className: '' },
  { items: TESTIMONIALS.slice(3, 6), duration: 42, className: 'hidden md:block' },
  { items: TESTIMONIALS.slice(6, 9), duration: 38, className: 'hidden lg:block' },
];

function TestimonialCard({ quote, author, place, avatar }: Testimonial) {
  return (
    <li className="w-full max-w-xs rounded-3xl border border-ink-200 bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <blockquote>
        <div className="flex gap-0.5" aria-label="5 de 5 estrellas">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-4 fill-clay-500 text-clay-500" />
          ))}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-700">“{quote}”</p>

        <footer className="mt-6 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            className="size-10 rounded-full object-cover ring-2 ring-ink-100"
          />
          <div className="flex flex-col">
            <cite className="text-sm font-medium not-italic leading-5 text-ink-900">{author}</cite>
            <span className="text-xs leading-5 text-ink-500">{place}</span>
          </div>
        </footer>
      </blockquote>
    </li>
  );
}

/**
 * Columna en bucle: la lista se duplica y se desplaza media altura,
 * de modo que el salto coincide exactamente con el inicio.
 * La copia se oculta a la tecnología asistiva para no leer todo dos veces.
 */
function TestimonialsColumn({
  items,
  duration,
  className,
}: {
  items: Testimonial[];
  duration: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <ul
        className="animate-marquee-up flex list-none flex-col gap-6 pb-6 [animation-play-state:running] hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        {items.map((testimonial) => (
          <TestimonialCard key={testimonial.author} {...testimonial} />
        ))}
        {items.map((testimonial) => (
          <li key={`copia-${testimonial.author}`} aria-hidden className="contents">
            <TestimonialCard {...testimonial} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Testimonials() {
  return (
    <section aria-labelledby="testimonios" className="relative mt-24 overflow-hidden py-16">
      <div className="container-page">
        <header className="mx-auto mb-14 flex max-w-xl flex-col items-center text-center">
          <span className="rounded-full border border-ink-300 bg-ink-100/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ink-600">
            Testimonios
          </span>

          <h2
            id="testimonios"
            className="mt-6 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl"
          >
            Lo que dicen nuestros huéspedes
          </h2>

          <p className="mt-4 text-base leading-relaxed text-ink-600">
            Historias de viajeros que ya encontraron su Airbnb PyFGroup en el Perú.
          </p>
        </header>

        {/* El degradado de máscara desvanece las tarjetas arriba y abajo. */}
        <div
          role="region"
          aria-label="Testimonios en desplazamiento"
          className="flex max-h-[700px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
        >
          {COLUMNS.map((column, index) => (
            <TestimonialsColumn key={index} {...column} />
          ))}
        </div>
      </div>
    </section>
  );
}