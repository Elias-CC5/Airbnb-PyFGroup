'use client';

import { Star } from 'lucide-react';
import { useEffect, useRef } from 'react';

/**
 * `bottom` → dónde se apoya la capa (vh, negativo = por debajo del viewport)
 * `range`  → desplazamiento al recorrer la sección (vh, negativo = sube)
 */
const LAYERS = [
  { src: '/parallax/capa-3.webp', bottom: 0, range: 4 },    // cielo
  { src: '/parallax/capa-2.webp', bottom: 0, range: 0 },    // montaña: INMÓVIL
  { src: '/parallax/capa-1.webp', bottom: -40, range: -38 }, // suelo + hombre: sube y tapa
];

const TITLE_RANGE = -6;

export function ParallaxHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const update = () => {
      frame.current = null;

      const rect = section.getBoundingClientRect();
      const travel = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);

      layerRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(0, ${progress * LAYERS[i].range}vh, 0)`;
      });

      if (titleRef.current) {
        titleRef.current.style.transform = `translate3d(0, ${progress * TITLE_RANGE}vh, 0)`;
      }
    };

    const onScroll = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[180vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink-950">
        {LAYERS.map((layer, index) => (
          <div
            key={layer.src}
            ref={(el) => {
              layerRefs.current[index] = el;
            }}
            className={`absolute inset-x-0 will-change-transform ${index === 2 ? 'z-20' : ''}`}
            style={{ bottom: `${layer.bottom}vh` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={layer.src}
              alt=""
              loading="eager"
              className="block h-auto w-full min-h-screen object-cover object-bottom [filter:contrast(1.07)_saturate(1.06)]"
            />
          </div>
        ))}

        {/* Grano de película: enmascara el reescalado de las capas. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[25] opacity-[0.09] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'repeat',
            backgroundSize: '180px 180px',
          }}
        />

        {/* Titular: entre la montaña y el suelo */}
        <div
          ref={titleRef}
          className="absolute inset-x-0 top-[16vh] z-10 flex flex-col items-center px-6 text-center will-change-transform"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <Star className="size-3.5 fill-white" />
            Más de 1.200 huéspedes hospedados este año
          </span>

          <h1 className="mt-5 text-6xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)] sm:text-8xl lg:text-[9vw]">
            El Perú
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            Casas, departamentos y cabañas seleccionadas una por una. Reserva en línea, paga en soles y
            coordina directo con el anfitrión.
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-24 z-40 px-5">
          <div className="mx-auto max-w-4xl">
          </div>
        </div>
      </div>
    </section>
  );
}