'use client';

import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

interface GlobeProps {
  /** Diámetro en píxeles. */
  size?: number;
  className?: string;
}

/**
 * Globo terráqueo puramente en CSS: una textura equirectangular desplazándose
 * en bucle sobre una esfera simulada con sombras internas.
 * Sin canvas, sin WebGL, sin dependencias.
 */
export function Globe({ size = 260, className }: GlobeProps) {
  return (
    <div
      aria-hidden
      className={cn('globe-sphere rounded-full', className)}
      style={
        {
          width: size,
          height: size,
          // El desplazamiento se escala con el tamaño para que la rotación
          // se vea igual de fluida en cualquier diámetro.
          '--globe-shift': `${size * 1.6}px`,
        } as CSSProperties
      }
    />
  );
}

export default Globe;