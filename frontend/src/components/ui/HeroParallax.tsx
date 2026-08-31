'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';

export interface ParallaxItem {
  title: string;
  /** Ruta interna. Se navega con el router, no con una recarga completa. */
  href: string;
  thumbnail: string;
  /** Línea pequeña bajo el título al pasar el cursor: precio, distrito… */
  meta?: string;
}

interface HeroParallaxProps {
  items: ParallaxItem[];
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Párrafo de apoyo. Debajo del subtítulo, más pequeño. */
  blurb: string;
  /** Tres apuntes cortos, separados por una raya. */
  facts: [string, string, string];
  cta: { label: string; href: string };
}

/** Tamaño real de cada tarjeta. Se le pasa a next/image para que sirva ese ancho. */
const ANCHO = 480;
const ALTO = 384;

/**
 * Portada con tres filas de tarjetas que se desplazan en sentidos opuestos
 * mientras se baja, sobre un plano inclinado que se endereza.
 *
 * Sobre el rendimiento, que es lo que más cuesta aquí:
 *
 * - NO se usa `useSpring`. El diseño original envuelve cada valor en un muelle,
 *   y eso hace que las tarjetas *persigan* al scroll: llegan tarde y siguen
 *   moviéndose después de que el visitante para. Se percibe como pesadez
 *   aunque el navegador vaya sobrado de fotogramas. Con `useTransform` a secas
 *   el movimiento va pegado a la rueda y se siente inmediato.
 * - No se anima la opacidad de la capa grande. Hacerlo obliga a una pasada de
 *   composición extra sobre varios miles de píxeles en cada fotograma.
 * - Tampoco lleva `will-change: transform`. En un elemento pequeño ayuda; en
 *   una capa de este tamaño obliga a reservar una textura enorme y cuesta más
 *   de lo que ahorra.
 * - `next/image` sirve cada foto redimensionada a 480px en AVIF o WebP. Ojo:
 *   exige que el host esté declarado en `next.config.ts`, o la página falla.
 * - Con «reducir movimiento» activado no hay parallax.
 */
export function HeroParallax({
  items,
  eyebrow,
  title,
  subtitle,
  blurb,
  facts,
  cta,
}: HeroParallaxProps) {
  const quieto = useReducedMotion();

  // El diseño necesita quince tarjetas en tres filas de cinco. Si hay menos,
  // se repiten en ciclo: una fila a medias se ve rota.
  const quince = Array.from({ length: 15 }, (_, i) => items[i % Math.max(1, items.length)]).filter(
    Boolean,
  );

  const fila1 = quince.slice(0, 5);
  const fila2 = quince.slice(5, 10);
  const fila3 = quince.slice(10, 15);

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const desplazar = useTransform(scrollYProgress, [0, 1], [0, 1000]);
  const desplazarInverso = useTransform(scrollYProgress, [0, 1], [0, -1000]);
  const rotarX = useTransform(scrollYProgress, [0, 0.2], [15, 0]);
  const rotarZ = useTransform(scrollYProgress, [0, 0.2], [20, 0]);
  const desplazarY = useTransform(scrollYProgress, [0, 0.2], [-700, 500]);

  const plano = quieto ? undefined : { rotateX: rotarX, rotateZ: rotarZ, translateY: desplazarY };

  return (
    <div
      ref={ref}
      /*
        `z-0` encierra las capas de esta sección en su propio contexto de
        apilamiento. Sin él compiten con la barra de navegación, que flota por
        encima, y le roban los clics.
      */
      className="relative z-0 flex h-[300vh] flex-col self-auto overflow-hidden bg-white py-24 antialiased [perspective:1000px] [transform-style:preserve-3d] md:py-40"
    >
      <header className="relative mx-auto w-full max-w-3xl px-6 py-16 text-center md:py-28">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-500 sm:text-xs">{eyebrow}</p>

        <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-ink-900 md:text-7xl">
          {title}
        </h1>

        <p className="mt-6 text-lg leading-snug text-ink-700 md:text-2xl">{subtitle}</p>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-600 md:text-base">
          {blurb}
        </p>

        {/* Tres apuntes con raya en medio. Ocupan el hueco sin otro párrafo. */}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink-500 sm:text-sm">
          {facts.map((fact, i) => (
            <li key={fact} className="flex items-center gap-4">
              {i > 0 && <span aria-hidden className="h-px w-6 bg-ink-300" />}
              {fact}
            </li>
          ))}
        </ul>

        <Link
          href={cta.href}
          className="mt-9 inline-flex rounded-full bg-ink-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          {cta.label}
        </Link>
      </header>

      <motion.div style={plano}>
        <motion.div className="mb-20 flex flex-row-reverse space-x-20 space-x-reverse">
          {fila1.map((item, i) => (
            <Tarjeta
              key={`f1-${i}-${item.title}`}
              item={item}
              desplazar={quieto ? undefined : desplazar}
              prioritaria={i < 2}
            />
          ))}
        </motion.div>

        <motion.div className="mb-20 flex flex-row space-x-20">
          {fila2.map((item, i) => (
            <Tarjeta
              key={`f2-${i}-${item.title}`}
              item={item}
              desplazar={quieto ? undefined : desplazarInverso}
            />
          ))}
        </motion.div>

        <motion.div className="flex flex-row-reverse space-x-20 space-x-reverse">
          {fila3.map((item, i) => (
            <Tarjeta
              key={`f3-${i}-${item.title}`}
              item={item}
              desplazar={quieto ? undefined : desplazar}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function Tarjeta({
  item,
  desplazar,
  prioritaria = false,
}: {
  item: ParallaxItem;
  desplazar?: MotionValue<number>;
  prioritaria?: boolean;
}) {
  return (
    <motion.div
      style={desplazar ? { x: desplazar } : undefined}
      whileHover={{ y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group/tarjeta relative h-72 w-[22rem] shrink-0 md:h-96 md:w-[30rem]"
    >
      <Link href={item.href} className="block h-full w-full group-hover/tarjeta:shadow-2xl">
        <Image
          src={item.thumbnail}
          alt={item.title}
          width={ANCHO}
          height={ALTO}
          sizes="(max-width: 768px) 22rem, 30rem"
          // Sólo las dos primeras se cargan de inmediato: el resto entra al
          // acercarse. Cargarlas todas de golpe atasca el primer pintado.
          priority={prioritaria}
          loading={prioritaria ? undefined : 'lazy'}
          className="absolute inset-0 h-full w-full rounded-xl object-cover object-left-top"
        />

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl bg-black opacity-0 transition-opacity duration-300 group-hover/tarjeta:opacity-70"
        />

        <span className="pointer-events-none absolute bottom-5 left-5 right-5 opacity-0 transition-opacity duration-300 group-hover/tarjeta:opacity-100">
          <span className="block text-lg font-medium text-white">{item.title}</span>
          {item.meta && <span className="mt-1 block text-sm text-white/70">{item.meta}</span>}
        </span>
      </Link>
    </motion.div>
  );
}
