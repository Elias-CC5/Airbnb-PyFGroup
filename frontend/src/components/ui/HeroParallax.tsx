'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
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
const ANCHO = 600;
const ALTO = 600;

const MUELLE = { stiffness: 300, damping: 30, bounce: 100 };

/**
 * Portada con tres filas de tarjetas que se desplazan en sentidos opuestos
 * mientras se baja, sobre un plano inclinado que se endereza y se revela.
 *
 * Es el HeroParallax de Aceternity, con tres cosas adaptadas al proyecto:
 *
 * - Las tarjetas llevan `next/image` en vez de `<img>`, así cada foto se sirve
 *   redimensionada en AVIF o WebP. Exige que el host esté declarado en
 *   `next.config.ts`, o la página falla al renderizar.
 * - Los enlaces son `next/link`: son rutas internas y no deben recargar.
 * - La sección lleva `z-0`. Sin él sus capas compiten con la barra de
 *   navegación, que flota por encima, y le roban los clics.
 *
 * Con «reducir movimiento» activado no hay parallax.
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

  const desplazar = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1000]), MUELLE);
  const desplazarInverso = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1000]), MUELLE);
  const rotarX = useSpring(useTransform(scrollYProgress, [0, 0.2], [15, 0]), MUELLE);
  const rotarZ = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), MUELLE);
  const desplazarY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), MUELLE);
  const revelar = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), MUELLE);

  const plano = quieto
    ? undefined
    : { rotateX: rotarX, rotateZ: rotarZ, translateY: desplazarY, opacity: revelar };

  return (
    <div
      ref={ref}
      className="relative z-0 flex h-[300vh] flex-col self-auto overflow-hidden bg-white py-40 antialiased [perspective:1000px] [transform-style:preserve-3d]"
    >
      <header className="relative left-0 top-0 mx-auto w-full max-w-7xl px-4 py-20 md:py-40">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-500 sm:text-xs">{eyebrow}</p>

        <h1 className="mt-5 text-2xl font-bold leading-[1.02] tracking-tight text-ink-900 md:text-7xl">
          {title}
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-snug text-ink-700 md:text-xl">{subtitle}</p>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-600 md:text-base">{blurb}</p>

        {/* Tres apuntes con raya en medio. Ocupan el hueco sin otro párrafo. */}
        <ul className="mt-8 flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500 sm:text-sm">
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
      className="group/tarjeta relative h-96 w-[30rem] shrink-0"
    >
      <Link href={item.href} className="block h-full w-full group-hover/tarjeta:shadow-2xl">
        <Image
          src={item.thumbnail}
          alt={item.title}
          width={ANCHO}
          height={ALTO}
          sizes="30rem"
          // Sólo las dos primeras se cargan de inmediato: el resto entra al
          // acercarse. Cargarlas todas de golpe atasca el primer pintado.
          priority={prioritaria}
          loading={prioritaria ? undefined : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover object-left-top"
        />
      </Link>

      <div className="pointer-events-none absolute inset-0 h-full w-full bg-black opacity-0 group-hover/tarjeta:opacity-80" />

      <div className="pointer-events-none absolute bottom-4 left-4 opacity-0 group-hover/tarjeta:opacity-100">
        <span className="block text-white">{item.title}</span>
        {item.meta && <span className="mt-1 block text-sm text-white/70">{item.meta}</span>}
      </div>
    </motion.div>
  );
}
