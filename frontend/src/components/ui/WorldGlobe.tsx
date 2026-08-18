'use client';

import { cn } from '@/lib/utils';
import createGlobe, { type COBEOptions } from 'cobe';
import { useEffect, useRef } from 'react';

/**
 * Ángulos que dejan una coordenada mirando a cámara.
 * Es el helper de los ejemplos oficiales de cobe.
 */
function locationToAngles(lat: number, lng: number): [number, number] {
  return [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
}

/** Lima: el globo abre mirando al Perú. */
const [BASE_PHI, BASE_THETA] = locationToAngles(-12.0464, -77.0428);

/** Ciudades peruanas con presencia en la plataforma. */
const PERU_MARKERS: COBEOptions['markers'] = [
  { location: [-12.0464, -77.0428], size: 0.11 }, // Lima
  { location: [-13.5319, -71.9675], size: 0.08 }, // Cusco
  { location: [-16.409, -71.5375], size: 0.07 }, // Arequipa
  { location: [-8.1116, -79.0288], size: 0.06 }, // Trujillo
  { location: [-3.7437, -73.2516], size: 0.06 }, // Iquitos
  { location: [-15.8402, -70.0219], size: 0.05 }, // Puno
  { location: [-5.1945, -80.6328], size: 0.05 }, // Piura
];

interface WorldGlobeProps {
  className?: string;
  /** Lado del globo en píxeles. Si se omite, se adapta al contenedor. */
  size?: number;
}

/**
 * Globo interactivo (cobe) centrado en el Perú. Se arrastra para girarlo y no
 * rota solo, para que el país quede siempre a la vista al cargar.
 */
export function WorldGlobe({ className, size }: WorldGlobeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Estado de arrastre e inercia, fuera de React para no re-renderizar por frame.
  const pointerX = useRef<number | null>(null);
  const rotation = useRef(0);
  const target = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    // El canvas debe tener lado > 0 antes de crear el globo: con 0 no dibuja nada.
    let side = size ?? Math.round(wrapper.getBoundingClientRect().width) ?? 0;
    if (!side) side = 400;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: side * 2,
      height: side * 2,
      phi: BASE_PHI,
      theta: BASE_THETA,
      dark: 0,
      diffuse: 0.4,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [1, 1, 1],
      // ink-900 (#171717): el mismo acento monocromo del resto del sitio.
      markerColor: [0.09, 0.09, 0.09],
      glowColor: [1, 1, 1],
      markers: PERU_MARKERS,
      onRender: (state) => {
        // Interpolación suave hacia la posición arrastrada.
        rotation.current += (target.current - rotation.current) * 0.08;
        state.phi = BASE_PHI + rotation.current;
        state.width = side * 2;
        state.height = side * 2;
      },
    });

    // Se revela cuando ya hay algo pintado, para evitar el parpadeo inicial.
    const reveal = window.setTimeout(() => {
      canvas.style.opacity = '1';
    }, 120);

    // Si el contenedor cambia de ancho, recreamos el globo con el lado correcto.
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next && Math.abs(next - side) > 8 && !size) side = next;
    });
    observer.observe(wrapper);

    return () => {
      window.clearTimeout(reveal);
      observer.disconnect();
      globe.destroy();
    };
  }, [size]);

  const onPointerDown = (clientX: number) => {
    pointerX.current = clientX;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  const onPointerUp = () => {
    pointerX.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
  };

  const onMove = (clientX: number) => {
    if (pointerX.current === null) return;
    target.current += (clientX - pointerX.current) / 200;
    pointerX.current = clientX;
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('relative mx-auto aspect-square w-full max-w-[440px]', className)}
      style={size ? { width: size, height: size } : undefined}
    >
      <canvas
        ref={canvasRef}
        aria-label="Globo terráqueo centrado en el Perú"
        className="size-full cursor-grab opacity-0 transition-opacity duration-700"
        onPointerDown={(e) => onPointerDown(e.clientX)}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerMove={(e) => onMove(e.clientX)}
      />
    </div>
  );
}

export default WorldGlobe;
