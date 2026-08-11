'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useRef, type ReactNode } from 'react';

interface Layer {
  src: string;
  /** Desplazamiento vertical al final del recorrido, en % de la altura del viewport. */
  yPercent: number;
  alt?: string;
  className?: string;
}

interface ParallaxSceneProps {
  layers: Layer[];
  /** Contenido intercalado entre capas (normalmente el titular). */
  title?: ReactNode;
  /** Posición del titular dentro del apilado: se dibuja tras esta capa. */
  titleAfterLayer?: number;
  /** Desplazamiento del titular, en % del viewport. */
  titleYPercent?: number;
  /** Altura del recorrido. 2 = dos pantallas de scroll. */
  scrollLength?: number;
  className?: string;
}

/**
 * Escena de parallax por capas: mientras el bloque atraviesa el viewport,
 * cada capa se desplaza a distinta velocidad y genera la sensación de profundidad.
 *
 * Scroll nativo + transform: sin GSAP, sin Lenis, sin secuestrar el scroll.
 */
export function ParallaxScene({
  layers,
  title,
  titleAfterLayer = 1,
  titleYPercent = 40,
  scrollLength = 2,
  className,
}: ParallaxSceneProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
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
      // 0 cuando el bloque toca la parte superior · 1 cuando termina su recorrido.
      const travel = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / travel, 0), 1);

      layerRefs.current.forEach((el, index) => {
        if (!el) return;
        el.style.transform = `translate3d(0, ${progress * layers[index].yPercent}%, 0)`;
      });

      if (titleRef.current) {
        titleRef.current.style.transform = `translate3d(0, ${progress * titleYPercent}%, 0)`;
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
  }, [layers, titleYPercent]);

  return (
    <section
      ref={sectionRef}
      className={cn('relative w-full', className)}
      style={{ height: `${scrollLength * 100}vh` }}
    >
      {/* El lienzo queda pegado mientras dura el recorrido. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink-950">
        {layers.map((layer, index) => (
          <div key={layer.src} className="contents">
            <div
              ref={(el) => {
                layerRefs.current[index] = el;
              }}
              className={cn('absolute inset-0 will-change-transform', layer.className)}
            >
              <Image
                src={layer.src}
                alt={layer.alt ?? ''}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-bottom"
              />
            </div>

            {/* El titular se intercala entre capas para quedar detrás del primer plano. */}
            {title && index === titleAfterLayer && (
              <div
                ref={titleRef}
                className="absolute inset-0 z-10 flex items-center justify-center will-change-transform"
              >
                {title}
              </div>
            )}
          </div>
        ))}

        {/* Desvanecido inferior para empalmar con la siguiente sección. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>
    </section>
  );
}