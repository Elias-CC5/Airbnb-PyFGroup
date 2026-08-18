'use client';

import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

/**
 * Foto cenital de un avión con fondo transparente.
 * Es un recurso alojado por un tercero: si algún día deja de responder,
 * descarga la imagen a `public/avion.webp` y pasa `imageUrl="/avion.webp"`.
 */
const DEFAULT_PLANE =
  'https://cdn.prod.website-files.com/661fdce3e735db03332bf817/66223004372c7c1124c1b0d1_Top-view2x-p-2000.webp';

interface ScrollFlyInProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Contenido estático que queda centrado mientras el avión cruza. */
  children: React.ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  /** id del bloque al que baja el botón. Sin esto, no se muestra el botón. */
  scrollToId?: string;
  scrollLabel?: string;
}

/**
 * El avión cruza la pantalla de izquierda a derecha a medida que se hace scroll.
 * El texto permanece fijo en el centro.
 */
function ScrollFlyIn({
  children,
  imageUrl = DEFAULT_PLANE,
  imageAlt = 'Avión sobrevolando',
  scrollToId,
  scrollLabel = 'Ver destinos',
  className,
  ...props
}: ScrollFlyInProps) {
  const targetRef = React.useRef<HTMLDivElement>(null);

  // window no existe durante el render en servidor: se mide tras montar.
  const [viewport, setViewport] = React.useState(1280);
  React.useEffect(() => {
    const measure = () => setViewport(window.innerWidth);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  const travel = viewport + 900;
  const x = useTransform(scrollYProgress, [0.1, 0.9], [-travel, travel]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.28, 0.72, 0.9], [0, 1, 1, 0]);

  const scrollDown = () => {
    if (!scrollToId) return;
    document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={targetRef} className={cn('relative h-[180vh]', className)} {...props}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-x-clip">
        <div className="z-10 text-center">
          {children}

          {scrollToId && (
            <button
              type="button"
              onClick={scrollDown}
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              {scrollLabel}
              <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5" />
            </button>
          )}
        </div>

        <motion.div
          style={{ x, opacity }}
          className="pointer-events-none absolute inset-0 z-20 flex items-center"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-auto w-[460px] max-w-none drop-shadow-2xl md:w-[760px]"
          />
        </motion.div>
      </div>
    </div>
  );
}

export { ScrollFlyIn };
