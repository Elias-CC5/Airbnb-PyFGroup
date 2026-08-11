'use client';

import { Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

/**
 * Cada capa se ancla al borde INFERIOR del lienzo y se extiende hacia arriba
 * (y hacia abajo si necesita subir). Todo en vh, para que sea predecible.
 *
 *   height → alto de la capa
 *   bottom → dónde queda su base (negativo = por debajo del viewport)
 *   range  → cuánto se desplaza al recorrer la sección (negativo = sube)
 */
const LAYERS = [
  { src: '/parallax/capa-3.webp', height: 150, bottom: 0, range: 5 },     // cielo
  { src: '/parallax/capa-2.webp', height: 150, bottom: 0, range: 0 },     // montaña: INMÓVIL
  { src: '/parallax/capa-1.webp', height: 190, bottom: -35, range: -28 }, // suelo + hombre: sube
];

const TITLE_RANGE = -8;

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
        if (!el) return;
        el.style.transform = `translate3d(0, ${progress * LAYERS[i].range}vh, 0)`;
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
            style={{
              height: `${layer.height}vh`,
              bottom: `${layer.bottom}vh`,
            }}
          >
            <Image
              src={layer.src}
              alt=""
              fill
              priority
              quality={90}
              sizes="100vw"
              // El contenido de estas tiras vive en su parte inferior.
              className="object-cover object-bottom"
            />
          </div>
        ))}

        {/* Titular: entre la montaña y el suelo, por eso queda tapado al subir el terreno */}
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

        <div className="absolute inset-x-0 bottom-10 z-30 px-5">
          <div className="mx-auto max-w-4xl">
          </div>
        </div>
      </div>
    </section>
  );
}