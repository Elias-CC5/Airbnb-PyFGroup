'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, type ReactNode } from 'react';

interface ParallaxProps {
  children: ReactNode;
  /**
   * Velocidad relativa al scroll. Positivo = se mueve con el scroll (parece lejano);
   * negativo = se mueve en contra (parece cercano). 0 = fijo al contenedor.
   */
  speed?: number;
  className?: string;
}

/**
 * Desplaza su contenido según la posición del elemento en el viewport.
 * Sin dependencias: getBoundingClientRect + rAF + transform (compositor puro).
 */
export function Parallax({ children, speed = 0.2, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const update = () => {
      frame.current = null;
      const rect = el.getBoundingClientRect();
      // Distancia del centro del elemento al centro del viewport.
      const distance = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${distance * speed}px, 0)`;
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
  }, [speed]);

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}