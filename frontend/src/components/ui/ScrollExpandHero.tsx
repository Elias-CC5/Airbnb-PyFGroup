'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollExpandHeroProps {
  /** Foto que crece con el scroll. */
  mediaSrc: string;
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
 *
 * El fondo es sólido a propósito. Antes iba una segunda foto desenfocada, pero
 * dos fotos peleando por la misma pantalla ensucian el color y el resultado
 * depende de qué alojamiento esté destacado ese día. Un fondo oscuro fijo hace
 * que la foto que crece sea lo único que se mira.
 */
export function ScrollExpandHero({
  mediaSrc,
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

  const ancho = (isMobile ? 300 : 460) + progress * (isMobile ? 650 : 1100);
  const alto = (isMobile ? 380 : 520) + progress * (isMobile ? 220 : 300);
  const desplazamiento = progress * (isMobile ? 180 : 150);

  const [primera, ...resto] = title.split(' ');

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-start bg-ink-950">
        {/* Fondo sólido con un halo suave detrás de la foto. */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,#2c2724_0%,#1c1917_45%,#0c0a09_100%)]" />
          {/* El halo se apaga a medida que la foto ocupa la pantalla. */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_50%,rgba(255,255,255,0.10)_0%,transparent_70%)]"
            animate={{ opacity: 1 - progress }}
            transition={{ duration: 0.2 }}
          />
        </div>

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
                boxShadow: '0 30px 90px -20px rgba(0,0,0,0.75)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaSrc} alt={title} className="size-full object-cover" />
              <motion.div
                className="absolute inset-0 bg-ink-950"
                initial={{ opacity: 0.45 }}
                animate={{ opacity: 0.45 - progress * 0.35 }}
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* Titular partido en dos, que se separa al hacer scroll */}
            <div
              className="relative z-10 flex w-full flex-col items-center gap-2 text-center"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.65)' }}
            >
              {eyebrow && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/85">
                  {eyebrow}
                </p>
              )}

              <h1
                className="text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl"
                style={{ transform: `translateX(-${desplazamiento}vw)` }}
              >
                {primera}
              </h1>
              <h1
                className="text-5xl font-bold leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl"
                style={{ transform: `translateX(${desplazamiento}vw)` }}
              >
                {resto.join(' ')}
              </h1>
            </div>

            {/* Pista de "sigue bajando", sólo mientras no está abierta */}
            {hint && !expanded && (
              <motion.p
                className="absolute bottom-10 z-10 text-sm text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]"
                animate={{ opacity: 1 - progress * 1.4 }}
              >
                {hint}
              </motion.p>
            )}
          </div>

          {/* Contenido que aparece cuando la foto terminó de abrirse */}
          {children && (
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: expanded ? 1 : 0 }}
              transition={{ duration: 0.7 }}
              aria-hidden={!expanded}
            >
              {children}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
