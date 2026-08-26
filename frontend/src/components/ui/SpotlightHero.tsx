'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface SpotlightHeroProps {
  /** La foto. Se ve desenfocada de fondo y nítida dentro del foco. */
  image: string;
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
 * Portada con foco que sigue al cursor y enfoca la foto a su paso.
 *
 * Es la misma imagen dos veces: desenfocada al fondo y nítida encima, con una
 * máscara circular que sigue al puntero. Frente a usar dos fotos distintas, el
 * gesto se lee solo —el visitante entiende que está enfocando, no cambiando de
 * imagen— y además se descarga una sola foto.
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
  image,
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
      {/*
        Foto desenfocada. El `scale-110` compensa el borde: al desenfocar, los
        píxeles del contorno se estiran y dejarían un marco translúcido.
      */}
      <div
        aria-hidden
        className="hero-zoom absolute inset-0 z-10 scale-110 bg-cover bg-center bg-no-repeat blur-2xl"
        style={{ backgroundImage: `url("${image}")` }}
      />

      {/* La misma foto, nítida. Sólo se pinta donde la máscara deja pasar. */}
      {conCursor && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${image}")`,
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
        Redondea el borde inferior y deja asomar el blanco de la sección
        siguiente. Sin esto el paso de la foto oscura al blanco es un corte
        recto, que es justo lo que no gustó del hero anterior.
      */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[45] h-10 rounded-t-[40px] bg-white"
      />

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
