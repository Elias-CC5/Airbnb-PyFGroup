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
 * El fondo es blanco a propósito. Pasó por una segunda foto desenfocada y por
 * un degradado oscuro: la foto ensuciaba el color y el negro cortaba en seco
 * contra la sección blanca de abajo. En blanco no hay corte —el hero y el
 * resto de la página son el mismo lienzo— y la única mancha de color es la
 * foto que crece.
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
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-start bg-white">
        {/* Fondo blanco con un velo casi imperceptible hacia los bordes. */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(120%_90%_at_50%_0%,#ffffff_0%,#fafaf9_70%,#f5f5f4_100%)]" />

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
                boxShadow: '0 24px 70px -30px rgba(28,25,23,0.35)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaSrc} alt={title} className="size-full object-cover" />
              {/* Velo blanco que se disuelve: mientras la foto es chica deja
                  leer el titular encima; cuando ocupa la pantalla, se va. */}
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 0.35 - progress * 0.35 }}
                transition={{ duration: 0.2 }}
              />
              {/* Y un velo oscuro que entra sólo al final, para que el texto
                  que va encima de la foto se lea sobre cualquier imagen. */}
              {children && (
                <motion.div
                  className="absolute inset-0 bg-ink-950"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: expanded ? 0.5 : 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </div>

            {/* Titular partido en dos, que se separa al hacer scroll */}
            {/*
              Texto oscuro sobre blanco. El halo blanco del `textShadow` es lo
              único que lo sostiene en el tramo en que queda encima de la foto;
              sin él, una foto oscura se lo come.
            */}
            <div
              className="relative z-10 flex w-full flex-col items-center gap-1 text-center"
              style={{ textShadow: '0 1px 18px rgba(255,255,255,0.85)' }}
            >
              {eyebrow && (
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-ink-500">
                  {eyebrow}
                </p>
              )}

              <h1
                className="text-5xl font-semibold leading-[0.95] tracking-tight text-ink-900 md:text-7xl lg:text-8xl"
                style={{ transform: `translateX(-${desplazamiento}vw)` }}
              >
                {primera}
              </h1>
              <h1
                className="text-5xl font-semibold leading-[0.95] tracking-tight text-ink-900 md:text-7xl lg:text-8xl"
                style={{ transform: `translateX(${desplazamiento}vw)` }}
              >
                {resto.join(' ')}
              </h1>
            </div>

            {/*
              El texto va encima de la foto, no debajo: aparece en el centro
              cuando la imagen terminó de abrirse, justo donde el titular ya se
              apartó hacia los lados.
            */}
            {children && (
              <motion.div
                className="absolute inset-0 z-20 flex items-center justify-center px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: expanded ? 1 : 0 }}
                transition={{ duration: 0.7 }}
                style={{ pointerEvents: expanded ? 'auto' : 'none' }}
                aria-hidden={!expanded}
              >
                {children}
              </motion.div>
            )}

            {/* Pista de "sigue bajando", sólo mientras no está abierta */}
            {hint && !expanded && (
              <motion.p
                className="absolute bottom-10 z-10 text-xs uppercase tracking-[0.2em] text-ink-400 [text-shadow:0_1px_14px_rgba(255,255,255,0.9)]"
                animate={{ opacity: 1 - progress * 1.4 }}
              >
                {hint}
              </motion.p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
