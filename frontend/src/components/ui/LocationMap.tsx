'use client';

import { cn } from '@/lib/utils';
import { Map as MapIcon, Maximize2, Minimize2 } from 'lucide-react';
import { useRef, useState } from 'react';

interface LocationMapProps {
  /** Nombre legible del lugar. */
  location: string;
  lat: number;
  lng: number;
  /** `false` muestra la zona aproximada sin marcador. */
  precise?: boolean;
  className?: string;
}

/** -12.0464 → 12.0464° S */
function formatCoord(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

export function LocationMap({ location, lat, lng, precise = false, className }: LocationMapProps) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const span = precise ? 0.003 : 0.03;
  const bbox = [lng - span, lat - span, lng + span, lat + span].join(',');
  const embedUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}` +
    `&layer=mapnik${precise ? `&marker=${lat},${lng}` : ''}`;

  const coordinates = `${formatCoord(lat, 'N', 'S')}, ${formatCoord(lng, 'E', 'O')}`;

  /** Inclinación 3D siguiendo al cursor, solo mientras está colapsado. */
  const handleMouseMove = (event: React.MouseEvent) => {
    if (expanded || frame.current !== null) return;
    const { clientX, clientY } = event;

    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const dx = (clientX - rect.left) / rect.width - 0.5;
      const dy = (clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg)`;
    });
  };

  const reset = () => {
    setHovered(false);
    if (cardRef.current) cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      className={cn('relative select-none', className)}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={reset}
    >
      <div
        ref={cardRef}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-ink-200 bg-white',
          'transition-[height,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          expanded ? 'h-[420px] shadow-lg' : 'h-[160px] shadow-sm',
          hovered && !expanded && 'shadow-md',
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Mapa real: aparece al expandir. */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            expanded ? 'opacity-100 delay-100' : 'opacity-0',
          )}
        >
          <iframe
            src={embedUrl}
            title={`Mapa de ${location}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            // Colapsado no captura el puntero: la rueda desplaza la página.
            className={cn('size-full', expanded ? 'pointer-events-auto' : 'pointer-events-none')}
          />

          {!precise && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-clay-500/50 bg-clay-500/15"
            />
          )}
        </div>

        {/* Retícula decorativa mientras está colapsado. */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity duration-300',
            expanded ? 'opacity-0' : 'opacity-100',
          )}
        >
          <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.05]">
            <defs>
              <pattern id="mapa-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                <path d="M 22 0 L 0 0 0 22" fill="none" stroke="currentColor" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapa-grid)" className="text-ink-950" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-br from-ink-100/40 via-transparent to-ink-100/60" />
        </div>

        {/* Contenido superpuesto */}
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <MapIcon
              className={cn(
                'size-[18px] text-clay-600 transition-opacity duration-300',
                expanded && 'opacity-0',
              )}
            />

            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 backdrop-blur-sm transition-transform duration-200',
                hovered && 'scale-105',
              )}
            >
              <span className="size-1.5 rounded-full bg-success-500" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-ink-600">
                {precise ? 'Exacta' : 'Aproximada'}
              </span>
            </span>
          </div>

          <div
            className={cn(
              'space-y-1 rounded-xl transition-all duration-300',
              expanded && 'bg-white/85 p-3 backdrop-blur-sm',
            )}
          >
            <h3
              className={cn(
                'text-sm font-medium tracking-tight text-ink-900 transition-transform duration-300',
                hovered && !expanded && 'translate-x-1',
              )}
            >
              {location}
            </h3>

            <p
              className={cn(
                'overflow-hidden font-mono text-xs text-ink-500 transition-all duration-300',
                expanded ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              {coordinates}
            </p>

            <span
              aria-hidden
              className={cn(
                'block h-px origin-left bg-gradient-to-r from-clay-500/60 via-clay-400/30 to-transparent',
                'transition-transform duration-500 ease-out',
                hovered || expanded ? 'scale-x-100' : 'scale-x-[0.3]',
              )}
            />
          </div>
        </div>

        {/* Control de expansión */}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? 'Contraer el mapa' : 'Expandir el mapa'}
          aria-expanded={expanded}
          className={cn(
            'absolute z-20 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink-800 shadow-lg transition hover:bg-ink-50',
            expanded ? 'bottom-4 right-4' : 'inset-0 m-auto size-fit',
            !expanded && !hovered && 'opacity-0',
          )}
        >
          {expanded ? (
            <>
              <Minimize2 className="size-4" /> Contraer
            </>
          ) : (
            <>
              <Maximize2 className="size-4" /> Ver el mapa
            </>
          )}
        </button>
      </div>
    </div>
  );
}