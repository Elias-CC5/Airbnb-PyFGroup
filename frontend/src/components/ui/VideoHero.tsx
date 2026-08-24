'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface VideoHeroProps {
  /** Fuente del vídeo de fondo. Debe ser MP4 (H.264) para que Safari lo reproduzca. */
  videoSrc: string;
  /** Fotograma que se ve mientras carga, y en lugar del vídeo si no puede reproducirse. */
  poster?: string;
  /**
   * Las tres palabras del titular. Van escalonadas en diagonal —izquierda,
   * derecha, centro— así que conviene que sean cortas: una palabra larga en la
   * línea de la derecha se sale de la pantalla en móvil.
   */
  lines: [string, string, string];
  /** Párrafo corto al costado. Dos o tres renglones como máximo. */
  blurb: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  className?: string;
}

/**
 * Portada a pantalla completa con vídeo de fondo y titular en diagonal.
 *
 * El vídeo no va en bucle: arranca cuando la portada entra en pantalla, corre
 * una vez y se queda congelado en su último fotograma. Un bucle infinito en la
 * primera pantalla compite con el contenido y no deja de gastar batería aunque
 * el visitante ya haya bajado.
 *
 * No lleva navegación propia a propósito: la del sitio ya es `fixed` y flota
 * por encima de esta sección. Dos barras se pisarían.
 */
export function VideoHero({
  videoSrc,
  poster,
  lines,
  blurb,
  primary,
  secondary,
  className,
}: VideoHeroProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [termino, setTermino] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    const quietud = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Con "reducir movimiento" activado el vídeo no se reproduce nunca: queda
    // como una foto fija. Es exactamente lo que esa preferencia pide.
    if (quietud.matches) return;

    // Sólo corre mientras la portada está a la vista. Si el visitante baja a
    // mitad de la reproducción, se pausa; si vuelve a subir, retoma donde iba.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.25 },
    );

    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <section className={cn('relative h-[100dvh] overflow-hidden bg-ink-950', className)}>
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
        poster={poster}
        muted
        playsInline
        preload="metadata"
        onEnded={() => setTermino(true)}
        // Decorativo: no aporta nada que no esté en el texto de al lado.
        aria-hidden="true"
        tabIndex={-1}
      />

      {/*
        Velo oscuro. El titular es blanco y enorme, así que necesita fondo
        oscuro constante: sin esto desaparece cada vez que el vídeo pasa por una
        zona clara —cielo, nieve, un ventanal—. El degradado añade peso arriba y
        abajo, que es donde caen las palabras.
      */}
      <div className="absolute inset-0 bg-ink-950/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-transparent to-ink-950/70" />

      {/*
        El titular en diagonal. Un `<h1>` con tres bloques: el primero pegado a
        la izquierda, el segundo a la derecha, el tercero algo pasado del centro.
        En móvil el escalonado se apaga —todo a la izquierda— porque con el ancho
        de un teléfono la diagonal deja las palabras cortadas.
      */}
      <div className="relative flex h-full flex-col justify-center px-6 pt-24 pb-16 sm:px-10 lg:px-16">
        <h1
          className={cn(
            'flex flex-col font-normal uppercase tracking-tight text-white',
            'text-[17vw] leading-[0.92] md:text-[13vw] md:leading-[1.05]',
            '[text-shadow:0_4px_40px_rgba(0,0,0,0.35)]',
          )}
        >
          <span className="md:self-start">{lines[0]}</span>
          <span className="md:self-end">{lines[1]}</span>
          <span className="md:self-center md:pl-[8vw]">{lines[2]}</span>
        </h1>

        {/*
          El bloque de texto se apoya sobre el titular en escritorio —queda a la
          izquierda, a media altura, en el hueco que deja la diagonal— y pasa a
          fluir debajo en móvil, donde no hay hueco que aprovechar.
        */}
        <div className="mt-10 max-w-xs md:absolute md:left-6 md:top-1/2 md:mt-0 md:-translate-y-1/2 lg:left-16">
          <p className="text-sm leading-relaxed text-white/85 sm:text-base">{blurb}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={primary.href}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:bg-white/85"
            >
              {primary.label}
            </Link>

            <Link
              href={secondary.href}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/45 transition-colors hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          </div>
        </div>
      </div>

      {/*
        Sólo aparece cuando el vídeo ya terminó: hasta entonces la portada se
        mueve sola y no hace falta decirle a nadie que siga bajando.
      */}
      {termino && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-6 text-center text-[11px] uppercase tracking-[0.2em] text-white/50"
        >
          Desliza
        </span>
      )}
    </section>
  );
}
