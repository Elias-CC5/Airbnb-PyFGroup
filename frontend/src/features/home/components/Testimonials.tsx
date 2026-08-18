import { TestimonialSlider, type Review } from '@/components/ui/testimonial-slider-1';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}&h=${h}`;

const person = (id: string) => ({
  imageSrc: photo(id, 520, 700),
  thumbnailSrc: photo(id, 160, 200),
});

/**
 * CONTENIDO DE MUESTRA. Son testimonios de ejemplo, no reseñas reales.
 * Reemplázalos por reseñas verdaderas antes de usar el sitio comercialmente:
 * publicar opiniones inventadas como si fueran de clientes es publicidad
 * engañosa. El sistema de reseñas de la ficha ya guarda las auténticas.
 */
const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Marta Nilsson',
    affiliation: 'Estocolmo, Suecia',
    quote:
      'Llegamos del aeropuerto a las dos de la mañana y el anfitrión nos esperó despierto con las llaves. Después de veinte horas de vuelo, eso vale más que cualquier foto bonita.',
    ...person('1494790108377-be9c29b29330'),
  },
  {
    id: 2,
    name: 'Thomas Béranger',
    affiliation: 'Lyon, Francia',
    quote:
      'El departamento da al Parque de las Aguas. La primera noche nos quedamos en la ventana mirando las fuentes encendidas sin hacer nada más. La cocina tenía hasta arrocera.',
    ...person('1472099645785-5658abf4ff4e'),
  },

  {
    id: 4,
    name: "Daniel O'Sullivan",
    affiliation: 'Dublín, Irlanda',
    quote:
      'Reservé por WhatsApp en diez minutos, sin tarjeta de por medio ni comisiones raras al final. Se siente como alquilarle a una persona, no a una aplicación.',
    ...person('1506794778202-cad84cf45f1d'),
  },
  {
    id: 5,
    name: 'Camila Restrepo',
    affiliation: 'Medellín, Colombia',
    quote:
      'Seis noches trabajando remoto y el wifi aguantó videollamadas todos los días. Un detalle honesto: los sábados se escucha la avenida hasta tarde, pero con la ventana cerrada se duerme bien.',
    ...person('1517841905240-472988babdf9'),
  },
];

export function Testimonials() {
  return (
    <section className="container-page py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
          Testimonios
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Gente que vino de lejos y volvió a escribirnos
        </h2>
      </header>

      <TestimonialSlider reviews={REVIEWS} />
    </section>
  );
}
