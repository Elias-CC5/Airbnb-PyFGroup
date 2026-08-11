'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Longitud de la diagonal que cruza la esquina recortada. */
const SQRT_5000 = Math.sqrt(5000);

interface Testimonial {
  tempId: number;
  quote: string;
  author: string;
  place: string;
  avatar: string;
}

const AVATAR = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=200&h=240`;

const TESTIMONIALS: Testimonial[] = [
  {
    tempId: 0,
    quote:
      'Reservamos una casa en el Valle Sagrado y todo fue tal cual las fotos. El anfitrión nos escribió por WhatsApp el mismo día.',
    author: 'Lucía Fernández',
    place: 'Viaje a Cusco',
    avatar: AVATAR('1494790108377-be9c29b29330'),
  },
  {
    tempId: 1,
    quote:
      'Me encantó poder filtrar por fechas y ver solo lo realmente disponible. Nos ahorró un montón de mensajes.',
    author: 'Diego Ramos',
    place: 'Escapada a Paracas',
    avatar: AVATAR('1472099645785-5658abf4ff4e'),
  },
  {
    tempId: 2,
    quote:
      'Precios en soles, sin conversiones raras. Reservé en la noche y al día siguiente ya estaba confirmada.',
    author: 'Valeria Chávez',
    place: 'Fin de semana en Máncora',
    avatar: AVATAR('1438761681033-6461ffad8d80'),
  },
  {
    tempId: 3,
    quote:
      'Viajamos con mis papás y necesitábamos algo accesible. La descripción era clarísima y no hubo sorpresas al llegar.',
    author: 'Andrés Quispe',
    place: 'Estadía en Arequipa',
    avatar: AVATAR('1507003211169-0a1dd7228f2d'),
  },
  {
    tempId: 4,
    quote:
      'La cabaña en Huaraz tenía chimenea y agua caliente de verdad, que en la sierra no es poca cosa. Repetiríamos sin dudar.',
    author: 'Camila Rojas',
    place: 'Trekking en Áncash',
    avatar: AVATAR('1534528741775-53994a69daeb'),
  },
  {
    tempId: 5,
    quote:
      'Cancelé con dos semanas de anticipación y el proceso fue transparente, sin llamadas ni letra chica.',
    author: 'Aliza Núñez',
    place: 'Reserva en Ica',
    avatar: AVATAR('1517841905240-472988babdf9'),
  },
  {
    tempId: 6,
    quote:
      'Buscaba algo para el equipo de la oficina y encontré una casa para diez personas a media hora de Lima.',
    author: 'Fernando Silva',
    place: 'Escapada a Asia',
    avatar: AVATAR('1500648767791-00dcc994a43e'),
  },
  {
    tempId: 7,
    quote:
      'El lodge en la selva superó lo que esperábamos. Coordinar el traslado por WhatsApp fue lo más fácil del viaje.',
    author: 'Sandra Shapiama',
    place: 'Viaje a Iquitos',
    avatar: AVATAR('1544005313-94ddf0286df2'),
  },
  {
    tempId: 8,
    quote:
      'Soy anfitriona y publicar mi departamento fue directo. Las reservas empezaron a llegar la primera semana.',
    author: 'Hassan Alí',
    place: 'Anfitrión en Miraflores',
    avatar: AVATAR('1506794778202-cad84cf45f1d'),
  },
];

interface CardProps {
  /** 0 es la tarjeta central; negativo a la izquierda, positivo a la derecha. */
  position: number;
  testimonial: Testimonial;
  onMove: (steps: number) => void;
  size: number;
}

function TestimonialCard({ position, testimonial, onMove, size }: CardProps) {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => onMove(position)}
      role="button"
      tabIndex={isCenter ? 0 : -1}
      aria-current={isCenter}
      className={cn(
        'absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out',
        isCenter
          ? 'z-10 border-clay-600 bg-clay-600 text-white'
          : 'z-0 border-ink-200 bg-white text-ink-900 hover:border-clay-400',
      )}
      style={{
        width: size,
        height: size,
        // Esquinas superiores recortadas en diagonal: el rasgo del componente.
        clipPath:
          'polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)',
        transform: `
          translate(-50%, -50%)
          translateX(${(size / 1.5) * position}px)
          translateY(${isCenter ? -60 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? '0px 8px 0px 4px var(--color-ink-200)' : 'none',
      }}
    >
      {/* Línea que remata la esquina recortada. */}
      <span
        aria-hidden
        className={cn('absolute block origin-top-right rotate-45', isCenter ? 'bg-clay-700' : 'bg-ink-200')}
        style={{ right: -2, top: 48, width: SQRT_5000, height: 2 }}
      />

      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={testimonial.avatar}
          alt=""
          loading="lazy"
          className="h-14 w-12 shrink-0 bg-ink-100 object-cover object-top"
          style={{ boxShadow: '3px 3px 0px var(--color-ink-950)' }}
        />

        <div className="flex gap-0.5 pt-1" aria-label="5 de 5 estrellas">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn('size-3.5', isCenter ? 'fill-white text-white' : 'fill-clay-500 text-clay-500')}
            />
          ))}
        </div>
      </div>

      <blockquote
        className={cn(
          'mt-5 line-clamp-6 text-base font-medium leading-relaxed sm:text-lg',
          isCenter ? 'text-white' : 'text-ink-800',
        )}
      >
        “{testimonial.quote}”
      </blockquote>

      <footer
        className={cn(
          'absolute bottom-8 left-8 right-8 text-sm',
          isCenter ? 'text-white/85' : 'text-ink-500',
        )}
      >
        <cite className="block font-medium not-italic">{testimonial.author}</cite>
        <span className="text-xs">{testimonial.place}</span>
      </footer>
    </div>
  );
}

export function Testimonials() {
  const [size, setSize] = useState(365);
  const [list, setList] = useState(TESTIMONIALS);

  /** Desplaza el abanico: los extremos se reciclan al otro lado. */
  const move = (steps: number) => {
    setList((current) => {
      const next = [...current];

      if (steps > 0) {
        for (let i = steps; i > 0; i -= 1) {
          const item = next.shift();
          if (!item) break;
          next.push({ ...item, tempId: Math.random() });
        }
      } else {
        for (let i = steps; i < 0; i += 1) {
          const item = next.pop();
          if (!item) break;
          next.unshift({ ...item, tempId: Math.random() });
        }
      }

      return next;
    });
  };

  useEffect(() => {
    const update = () => setSize(window.matchMedia('(min-width: 640px)').matches ? 365 : 290);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <section aria-labelledby="testimonios" className="relative mt-24 py-16">
      <header className="container-page mx-auto mb-10 flex max-w-xl flex-col items-center text-center">
        <span className="rounded-full border border-ink-300 bg-ink-100/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-ink-600">
          Testimonios
        </span>

        <h2 id="testimonios" className="mt-6 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Lo que dicen nuestros huéspedes
        </h2>

        <p className="mt-4 text-base leading-relaxed text-ink-600">
          Historias de viajeros que ya encontraron dónde quedarse en el Perú.
        </p>
      </header>

      <div
        role="region"
        aria-roledescription="carrusel"
        aria-label="Testimonios de huéspedes"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            move(-1);
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            move(1);
          }
        }}
        className="relative w-full overflow-hidden bg-ink-50/60 outline-none focus-visible:ring-2 focus-visible:ring-clay-500"
        style={{ height: 600 }}
      >
        {list.map((testimonial, index) => {
          // Posición relativa al centro del abanico.
          const position =
            list.length % 2 ? index - (list.length + 1) / 2 : index - list.length / 2;

          return (
            <TestimonialCard
              key={testimonial.tempId}
              testimonial={testimonial}
              onMove={move}
              position={position}
              size={size}
            />
          );
        })}

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          <button
            onClick={() => move(-1)}
            aria-label="Testimonio anterior"
            className="grid size-14 place-items-center border-2 border-ink-200 bg-white text-ink-800 transition-colors hover:border-clay-600 hover:bg-clay-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500 focus-visible:ring-offset-2"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => move(1)}
            aria-label="Testimonio siguiente"
            className="grid size-14 place-items-center border-2 border-ink-200 bg-white text-ink-800 transition-colors hover:border-clay-600 hover:bg-clay-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500 focus-visible:ring-offset-2"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}