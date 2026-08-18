'use client';

import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import * as React from 'react';

/** Avión en vista cenital, en SVG: sin CDN externo ni imagen que se pueda caer. */
function PlaneTopView({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 200"
      role="img"
      aria-label="Avión sobrevolando"
      className={cn('h-auto w-[420px] md:w-[620px]', className)}
    >
      <g fill="currentColor">
        {/* Fuselaje */}
        <path d="M40 100 C 40 88, 70 80, 120 78 L 520 82 C 570 84, 600 92, 610 100 C 600 108, 570 116, 520 118 L 120 122 C 70 120, 40 112, 40 100 Z" />
        {/* Ala principal */}
        <path d="M300 92 L 250 18 L 288 18 L 360 90 Z" />
        <path d="M300 108 L 250 182 L 288 182 L 360 110 Z" />
        {/* Estabilizadores de cola */}
        <path d="M110 94 L 74 48 L 100 48 L 152 92 Z" />
        <path d="M110 106 L 74 152 L 100 152 L 152 108 Z" />
      </g>
      {/* Ventanillas */}
      <g fill="rgba(255,255,255,0.55)">
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={190 + i * 24} cy={100} r={3} />
        ))}
      </g>
    </svg>
  );
}

interface ScrollFlyInProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Contenido estático que queda centrado mientras el avión cruza. */
  children: React.ReactNode;
  /** Imagen opcional; si se omite se usa el avión en SVG. */
  imageUrl?: string;
  imageAlt?: string;
}

/**
 * El avión cruza la pantalla de izquierda a derecha a medida que se hace scroll.
 * El texto permanece fijo en el centro.
 */
const ScrollFlyIn = React.forwardRef<HTMLDivElement, ScrollFlyInProps>(function ScrollFlyIn(
  { children, imageUrl, imageAlt = 'Avión sobrevolando', className, ...props },
  _ref,
) {
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

  const travel = viewport + 800;
  const x = useTransform(scrollYProgress, [0.1, 0.9], [-travel, travel]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.28, 0.72, 0.9], [0, 1, 1, 0]);

  return (
    <div ref={targetRef} className={cn('relative h-[180vh]', className)} {...props}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-x-clip">
        <div className="z-10 text-center">{children}</div>

        <motion.div
          style={{ x, opacity }}
          className="pointer-events-none absolute inset-0 z-20 flex items-center"
          aria-hidden
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={imageAlt} className="h-auto w-auto max-w-none" />
          ) : (
            <PlaneTopView className="text-ink-900/85" />
          )}
        </motion.div>
      </div>
    </div>
  );
});

export { ScrollFlyIn };
