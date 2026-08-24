'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface VideoHeroProps {
  /** Fuente del vídeo de fondo. Debe ser MP4 (H.264) para que Safari lo reproduzca. */
  videoSrc: string;
  /** Imagen que se ve mientras el vídeo carga, y en lugar del vídeo si no puede reproducirse. */
  poster?: string;
  /** Etiqueta pequeña en mayúsculas, encima del título. */
  eyebrow: string;
  /** Primera línea del título: va en gris, se lee como el arranque de la frase. */
  titleTop: string;
  /** Segunda línea: va en oscuro y monta ligeramente sobre la primera. */
  titleBottom: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  className?: string;
}

/** Azul-pizarra del botón principal. Fuera del tema porque es exclusivo del hero. */
const OSCURO = '#202A36';
const OSCURO_HOVER = '#1A2229';

/**
 * Portada a pantalla completa con vídeo de fondo.
 *
 * El texto va oscuro sobre un velo blanco: es más legible que el blanco sobre
 * oscuro cuando el vídeo tiene zonas claras —cielo, paredes, ventanales— y no
 * se puede controlar qué fotograma toca en cada momento.
 *
 * No lleva navegación propia a propósito: la del sitio ya es `fixed` y flota
 * por encima de esta sección. Dos barras se pisarían.
 */
export function VideoHero({
  videoSrc,
  poster,
  eyebrow,
  titleTop,
  titleBottom,
  subtitle,
  primary,
  secondary,
  className,
}: VideoHeroProps) {
  const video = useRef<HTMLVideoElement>(null);

  // Quien pide menos movimiento en el sistema recibe el fotograma fijo. Un vídeo
  // en bucle a pantalla completa es justo lo que esa preferencia quiere evitar.
  useEffect(() => {
    const el = video.current;
    if (!el) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const aplicar = () => {
      if (media.matches) el.pause();
      else void el.play().catch(() => undefined);
    };

    aplicar();
    media.addEventListener('change', aplicar);
    return () => media.removeEventListener('change', aplicar);
  }, []);

  return (
    <section className={cn('relative h-[100dvh] overflow-hidden bg-ink-100', className)}>
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        src={videoSrc}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        // Decorativo: no aporta información que no esté en el texto de al lado.
        aria-hidden="true"
        tabIndex={-1}
      />

      {/*
        Velo doble. El plano blanco levanta el contraste general; el degradado
        aclara la mitad superior, que es donde cae el texto, sin apagar el vídeo
        entero. Sin esto el título gris desaparece cuando pasa una zona clara.
      */}
      <div className="absolute inset-0 bg-white/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/20 to-transparent" />

      <div className="relative flex h-full flex-col">
        {/*
          Empuja el bloque por encima del centro óptico. El hueco de arriba lo
          ocupa la barra flotante del sitio, así que el texto arranca por debajo
          de ella incluso en pantallas bajas.
        */}
        <div className="flex flex-1 items-center justify-center px-6 pt-24 pb-32 sm:pb-40 lg:pb-48">
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-600">
              {eyebrow}
            </p>

            <h1 className="font-normal leading-none tracking-tighter">
              <span className="block text-6xl text-ink-500 md:text-7xl lg:text-8xl">{titleTop}</span>
              {/*
                El solape es el gesto del diseño: la segunda línea sube 12 px y
                casi toca la primera. `leading-none` ya las junta; el margen
                negativo termina de cerrarlas.
              */}
              <span
                className="-mt-3 block text-6xl md:text-7xl lg:text-8xl"
                style={{ color: OSCURO }}
              >
                {titleBottom}
              </span>
            </h1>

            <p className="mx-auto mt-6 mb-6 max-w-2xl text-lg text-ink-600 md:text-xl">{subtitle}</p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={secondary.href}
                className="rounded-full bg-ink-300 px-4 py-2 font-medium text-ink-800 transition-colors hover:bg-ink-400"
              >
                {secondary.label}
              </Link>

              <Link
                href={primary.href}
                style={{ backgroundColor: OSCURO }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = OSCURO_HOVER;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = OSCURO;
                }}
                className="rounded-full px-4 py-2 font-medium text-white transition-colors"
              >
                {primary.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
