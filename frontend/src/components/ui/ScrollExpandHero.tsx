'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollExpandHeroProps {
  /** Foto que crece con el scroll. */
  mediaSrc: string;
  /** Foto de fondo que se desvanece mientras la otra crece. */
  bgImageSrc: string;
  title: string;
  eyebrow?: string;
  hint?: string;
  children?: ReactNode;
}

/**
 * Hero que expande una foto a medida que se hace scroll.
 *
 * Mientras la foto no está del todo abierta, la rueda del ratón alimenta la
 * animación en vez de desplazar la página. Ese secuestro está acotado a dos
 * condiciones —la página tiene que estar arriba del todo y la foto sin
 * expandir— para que nadie quede atrapado a media página. Con
 * `prefers-reduced-motion` no se secuestra nada: la foto arranca abierta.
 */
export function ScrollExpandHero({
  mediaSrc,
  bgImageSrc,
  title,
  eyebrow,
  hint,
  children,
}: ScrollExpandHeroProps) {
  const reduceMotion = useReducedMotion();

  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartY = useRef(0);

  // Sin animación: la foto ya está abierta y el scroll se comporta normal.
  useEffect(() => {
    if (!reduceMotion) return;
    setProgress(1);
    setExpanded(true);
  }, [reduceMotion]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const avanzar = useCallback((delta: number) => {
    setProgress((anterior) => {
      const siguiente = Math.min(Math.max(anterior + delta, 0), 1);
      if (siguiente >= 1) setExpanded(true);
      return siguiente;
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const enElTope = () => window.scrollY <= 5;

    const onWheel = (event: WheelEvent) => {
      // Volver a cerrar la foto sólo si ya se está arriba del todo.
      if (expanded) {
        if (event.deltaY < 0 && enElTope()) {
          setExpanded(false);
          setProgress(0.99);
          event.preventDefault();
        }
        return;
      }

      event.preventDefault();
      avanzar(event.deltaY * 0.0009);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0].clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!touchStartY.current) return;
      const actual = event.touches[0].clientY;
      const delta = touchStartY.current - actual;

      if (expanded) {
        if (delta < -20 && enElTope()) {
          setExpanded(false);
          setProgress(0.99);
          event.preventDefault();
        }
        return;
      }

      event.preventDefault();
      // Al cerrar hace falta más sensibilidad que al abrir.
      avanzar(delta * (delta < 0 ? 0.008 : 0.005));
      touchStartY.current = actual;
    };

    const onTouchEnd = () => {
      touchStartY.current = 0;
    };

    // Mientras la foto se abre la página no debe moverse.
    const onScroll = () => {
      if (!expanded) window.scrollTo(0, 0);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
    };
  }, [expanded, avanzar, reduceMotion]);

  const ancho = 300 + progress * (isMobile ? 650 : 1250);
  const alto = 400 + progress * (isMobile ? 200 : 400);
  const desplazamiento = progress * (isMobile ? 180 : 150);

  const [primera, ...resto] = title.split(' ');

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-start">
        {/* Fondo, que se apaga mientras la foto crece */}
        <motion.div
          className="absolute inset-0 z-0 h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 - progress }}
          transition={{ duration: 0.1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgImageSrc} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-ink-950/25" />
        </motion.div>

        <div className="relative z-10 flex w-full flex-col items-center">
          <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center">
            {/* Foto que se expande */}
            <div
              className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl"
              style={{
                width: `${ancho}px`,
                height: `${alto}px`,
                maxWidth: '95vw',
                maxHeight: '85vh',
                boxShadow: '0 0 60px rgba(0,0,0,0.35)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaSrc} alt={title} className="size-full object-cover" />
              <motion.div
                className="absolute inset-0 bg-ink-950/50"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0.65 - progress * 0.45 }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Titular partido en dos, que se separa al hacer scroll */}
            <div className="relative z-10 flex w-full flex-col items-center gap-3 text-center mix-blend-difference">
              {eyebrow && (
                <p
                  className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
                  style={{ transform: `translateX(-${desplazamiento}vw)` }}
                >
                  {eyebrow}
                </p>
              )}

              <h1
                className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl"
                style={{ transform: `translateX(-${desplazamiento}vw)` }}
              >
                {primera}
              </h1>
              <h1
                className="text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl"
                style={{ transform: `translateX(${desplazamiento}vw)` }}
              >
                {resto.join(' ')}
              </h1>
            </div>

            {/* Pista de "sigue bajando", sólo mientras no está abierta */}
            {hint && !expanded && (
              <motion.p
                className="absolute bottom-10 z-10 text-sm text-white/80"
                animate={{ opacity: 1 - progress * 1.4 }}
              >
                {hint}
              </motion.p>
            )}
          </div>

          {/* Contenido que aparece cuando la foto terminó de abrirse */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.7 }}
            aria-hidden={!expanded}
          >
            {children}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
