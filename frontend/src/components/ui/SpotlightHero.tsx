'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface SpotlightHeroProps {
  /** Foto de base, la que se ve siempre. */
  baseImage: string;
  /** Foto que asoma dentro del foco que sigue al cursor. */
  revealImage: string;
  /** Primera línea del titular. */
  titleTop: string;
  /** Segunda línea. Va pegada a la primera. */
  titleBottom: string;
  /** Texto de apoyo, abajo a la izquierda. */
  intro: string;
  /** Texto de la llamada a la acción, abajo a la derecha. */
  pitch: string;
  cta: { label: string; href: string };
  className?: string;
}

/** Radio del foco, en píxeles. */
const RADIO = 260;

/** Cuánto persigue el foco al cursor en cada fotograma. Más bajo = más rezago. */
const SUAVIZADO = 0.1;

/**
 * Degradado del foco. Replica los cortes del diseño original: opaco hasta el
 * 40%, y de ahí un desvanecido largo que evita el borde duro de círculo.
 */
const MASCARA = (x: number, y: number) =>
  `radial-gradient(circle ${RADIO}px at ${x}px ${y}px, ` +
  'rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%, ' +
  'rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%)';

/**
 * Perfiles del borde rasgado, en un lienzo de 1440x64 que se estira al ancho
 * de la pantalla. Van fijos a propósito: calcularlos al vuelo haría que el
 * borde cambiara en cada recarga.
 */
const RASGADO_FONDO =
  'M0,64 L0,50.3 L31.3,44.5 L62.6,27.3 L93.9,18.3 L125.2,11.9 L156.5,22.4 L187.8,22.1 L219.1,28.0 L250.4,13.0 L281.7,22.5 L313.0,43.2 L344.3,32.0 L375.7,38.3 L407.0,40.5 L438.3,20.8 L469.6,12.1 L500.9,21.1 L532.2,23.4 L563.5,6.6 L594.8,22.6 L626.1,20.5 L657.4,33.9 L688.7,43.0 L720.0,37.5 L751.3,40.3 L782.6,37.2 L813.9,30.7 L845.2,31.3 L876.5,23.3 L907.8,5.3 L939.1,23.1 L970.4,24.9 L1001.7,21.5 L1033.0,27.6 L1064.3,29.8 L1095.7,42.3 L1127.0,27.9 L1158.3,29.4 L1189.6,29.2 L1220.9,9.5 L1252.2,5.0 L1283.5,22.9 L1314.8,22.0 L1346.1,26.1 L1377.4,24.2 L1408.7,38.0 L1440.0,29.1 L1440,64 Z';

const RASGADO_FRENTE =
  'M0,64 L0,19.8 L31.3,24.2 L62.6,24.0 L93.9,17.6 L125.2,23.8 L156.5,28.6 L187.8,34.1 L219.1,33.5 L250.4,31.3 L281.7,29.3 L313.0,38.2 L344.3,36.9 L375.7,24.5 L407.0,17.4 L438.3,22.5 L469.6,17.7 L500.9,17.1 L532.2,30.1 L563.5,23.8 L594.8,25.7 L626.1,38.0 L657.4,31.8 L688.7,28.2 L720.0,19.3 L751.3,26.7 L782.6,21.1 L813.9,15.4 L845.2,21.0 L876.5,29.8 L907.8,35.4 L939.1,33.0 L970.4,35.1 L1001.7,38.8 L1033.0,27.8 L1064.3,33.5 L1095.7,21.1 L1127.0,23.5 L1158.3,14.4 L1189.6,24.6 L1220.9,30.3 L1252.2,19.3 L1283.5,31.8 L1314.8,38.0 L1346.1,35.6 L1377.4,27.4 L1408.7,35.8 L1440.0,22.5 L1440,64 Z';

/**
 * Portada con foco que sigue al cursor y descubre una segunda foto debajo.
 *
 * El diseño original monta la máscara pintando un canvas y sacando un
 * `toDataURL()` en cada fotograma. Eso codifica en base64 un lienzo del tamaño
 * de la pantalla sesenta veces por segundo: es de las operaciones más caras del
 * navegador y traba el cursor en cualquier portátil modesto. Aquí la máscara es
 * un `radial-gradient` de CSS, que el compositor resuelve sin tocar la CPU. El
 * resultado visual es el mismo, incluidos los cortes del degradado.
 *
 * En pantallas táctiles no hay cursor, así que el efecto se apaga y queda la
 * foto de base. Un foco parado en una esquina se ve como un fallo.
 *
 * No lleva navegación propia: la del sitio ya es `fixed` y flota por encima.
 */
export function SpotlightHero({
  baseImage,
  revealImage,
  titleTop,
  titleBottom,
  intro,
  pitch,
  cta,
  className,
}: SpotlightHeroProps) {
  const seccion = useRef<HTMLElement>(null);
  const crudo = useRef({ x: -9999, y: -9999 });
  const suave = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number | null>(null);

  const [foco, setFoco] = useState({ x: -9999, y: -9999 });
  const [conCursor, setConCursor] = useState(false);

  useEffect(() => {
    // `pointer: fine` distingue ratón o lápiz de un dedo. Sin él, el efecto
    // no tiene sentido y sólo gastaría batería.
    const fino = window.matchMedia('(pointer: fine)');
    setConCursor(fino.matches);

    const cambio = (e: MediaQueryListEvent) => setConCursor(e.matches);
    fino.addEventListener('change', cambio);
    return () => fino.removeEventListener('change', cambio);
  }, []);

  useEffect(() => {
    if (!conCursor) return;

    const mover = (e: PointerEvent) => {
      // Coordenadas relativas a la sección, no a la ventana: si la portada
      // deja de estar pegada arriba, el foco seguiría cuadrando.
      const caja = seccion.current?.getBoundingClientRect();
      crudo.current = {
        x: e.clientX - (caja?.left ?? 0),
        y: e.clientY - (caja?.top ?? 0),
      };
    };

    const paso = () => {
      // Interpolación simple: el foco llega tarde al cursor y eso es lo que
      // da la sensación de peso. Sin ella el círculo va pegado y parece un
      // recorte, no una luz.
      suave.current.x += (crudo.current.x - suave.current.x) * SUAVIZADO;
      suave.current.y += (crudo.current.y - suave.current.y) * SUAVIZADO;
      setFoco({ x: suave.current.x, y: suave.current.y });
      raf.current = requestAnimationFrame(paso);
    };

    window.addEventListener('pointermove', mover, { passive: true });
    raf.current = requestAnimationFrame(paso);

    return () => {
      window.removeEventListener('pointermove', mover);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [conCursor]);

  const mascara = MASCARA(foco.x, foco.y);

  return (
    <section
      ref={seccion}
      style={{ height: '100dvh' }}
      className={cn('relative h-screen w-full overflow-hidden bg-black', className)}
    >
      {/* Foto de base. El zoom lento de entrada le da algo de vida al arrancar. */}
      <div
        aria-hidden
        className="hero-zoom absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${baseImage}")` }}
      />

      {/* Foto que se descubre. Sólo se pinta donde la máscara deja pasar. */}
      {conCursor && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${revealImage}")`,
            maskImage: mascara,
            WebkitMaskImage: mascara,
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
          }}
        />
      )}

      {/* Velo sutil: el titular es blanco y las fotos pueden tener zonas claras. */}
      <div aria-hidden className="absolute inset-0 z-40 bg-gradient-to-b from-black/35 via-transparent to-black/55" />

      {/*
        Borde rasgado, como papel roto. Sustituye el corte recto entre la foto
        oscura y la sección blanca de abajo.

        Son dos capas: una detrás, más irregular y en un blanco cálido, y otra
        delante en blanco puro. Desfasadas, dan la sensación de dos hojas
        superpuestas en vez de una silueta plana.

        El perfil está calculado y escrito a mano, no generado en cada render:
        un borde que cambiara al recargar se notaría como un parpadeo.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[45]">
        <svg
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="block h-9 w-full translate-y-[3px] sm:h-12"
          aria-hidden
        >
          <path d={RASGADO_FONDO} fill="#f5f2ec" />
        </svg>

        <svg
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="-mt-8 block h-9 w-full sm:-mt-11 sm:h-12"
          aria-hidden
        >
          <path d={RASGADO_FRENTE} fill="#ffffff" />
        </svg>

        {/* Cierra hasta el borde: los SVG dejan un hilo de foto por debajo. */}
        <div className="-mt-px h-2 bg-white" />
      </div>

      {/*
        Arranca por debajo de la barra flotante del sitio, que es `fixed` y
        mide unos 88px con su margen. A `top-[14%]` el titular le pasaba por
        detrás en pantallas de portátil.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-[26%] z-50 flex flex-col items-center px-5 text-center sm:top-[24%]">
        <h1 className="leading-[0.95] text-white">
          <span
            className="hero-anim hero-reveal block text-5xl font-normal italic sm:text-7xl md:text-8xl"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            {titleTop}
          </span>
          <span
            className="hero-anim hero-reveal -mt-1 block text-5xl font-normal sm:text-7xl md:text-8xl"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            {titleBottom}
          </span>
        </h1>
      </div>

      <div
        className="hero-anim hero-fade absolute bottom-14 left-10 z-50 hidden max-w-[260px] sm:block md:left-14"
        style={{ animationDelay: '0.7s' }}
      >
        <p className="text-sm leading-relaxed text-white/80">{intro}</p>
      </div>

      <div
        className="hero-anim hero-fade absolute bottom-10 left-5 right-5 z-50 flex max-w-full flex-col items-start gap-4 sm:bottom-24 sm:left-auto sm:right-10 sm:max-w-[260px] sm:gap-5 md:right-14"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs leading-relaxed text-white/80 sm:text-sm">{pitch}</p>

        <Link
          href={cta.href}
          className="rounded-full bg-white px-7 py-3 text-sm font-medium text-ink-900 transition-all hover:scale-[1.03] hover:bg-white/90 hover:shadow-lg hover:shadow-black/20 active:scale-95"
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}
