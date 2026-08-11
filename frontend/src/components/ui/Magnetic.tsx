'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  /** Intensidad del desplazamiento hacia el cursor (0 = desactivado). */
  strength?: number;
  /** Inclinación 3D en grados. */
  tilt?: number;
  as?: ElementType;
  className?: string;
  [key: string]: unknown;
}

/**
 * Envoltorio "magnético": el elemento se inclina y sigue al cursor,
 * y vuelve a su sitio al salir. Sin dependencias — solo transform + rAF.
 * Se desactiva en dispositivos táctiles y con `prefers-reduced-motion`.
 */
export function Magnetic({
  children,
  strength = 0.25,
  tilt = 6,
  as: Component = 'div',
  className,
  ...props
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;

    const apply = (x: number, y: number, rx: number, ry: number, scale: number) => {
      el.style.transform = `perspective(900px) translate3d(${x}px, ${y}px, 0) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
    };

    const onMove = (event: MouseEvent) => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const rect = el.getBoundingClientRect();
        // Posición del cursor relativa al centro, normalizada a −1…1.
        const dx = (event.clientX - rect.left) / rect.width - 0.5;
        const dy = (event.clientY - rect.top) / rect.height - 0.5;

        el.style.transition = 'transform 0.15s ease-out';
        apply(dx * rect.width * strength, dy * rect.height * strength, -dy * tilt, dx * tilt, 1.03);
      });
    };

    const onLeave = () => {
      // Rebote elástico al soltar.
      el.style.transition = 'transform 0.7s cubic-bezier(0.22, 1.4, 0.36, 1)';
      apply(0, 0, 0, 0, 1);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [strength, tilt]);

  return (
    <Component ref={ref} className={cn('will-change-transform', className)} {...props}>
      {children}
    </Component>
  );
}