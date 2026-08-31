'use client';

import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
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
  cta: { label: string; href: string };
}

/** Suavizado de todos los movimientos. Sin esto el scroll se siente crudo. */
const MUELLE = { stiffness: 300, damping: 30, bounce: 100 } as const;

/**
 * Portada con tres filas de tarjetas que se desplazan en sentidos opuestos
 * mientras se baja, sobre un plano inclinado que se endereza.
 *
 * Adaptado del diseño de Aceternity. Cambios respecto al original:
 *
 * - Las tarjetas enlazan a rutas internas con `next/link`, no a webs externas.
 * - La sección mide 300vh. Es deliberado —el recorrido del scroll ES la
 *   animación— pero significa que el visitante baja tres pantallas antes de
 *   ver el resto de la página.
 * - Las imágenes van con `<img>` y no con `next/image` a propósito: aquí
 *   llegan de varios servicios (Cloudinary, Wikipedia, picsum) y `next/image`
 *   revienta la página entera si un host no está declarado en la
 *   configuración. Se pierde optimización a cambio de que nunca falle.
 */
export function HeroParallax({ items, eyebrow, title, subtitle, cta }: HeroParallaxProps) {
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
  const opacidad = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.2, 1]), MUELLE);
  const desplazarY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-700, 500]), MUELLE);

  return (
    <div
      ref={ref}
      /*
        `z-0` encierra las capas de esta sección en su propio contexto de
        apilamiento. Sin él compiten con la barra de navegación, que flota por
        encima, y le roban los clics.
      */
      className="relative z-0 flex h-[300vh] flex-col self-auto overflow-hidden bg-white py-40 antialiased [perspective:1000px] [transform-style:preserve-3d]"
    >
      <header className="relative left-0 top-0 mx-auto w-full max-w-7xl px-6 py-20 md:px-10 md:py-40">
        <p className="text-[11px] uppercase tracking-[0.28em] text-ink-500 sm:text-xs">{eyebrow}</p>

        <h1 className="mt-5 text-3xl font-semibold leading-[1.05] tracking-tight text-ink-900 md:text-7xl">
          {title}
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-600 md:text-xl">
          {subtitle}
        </p>

        <Link
          href={cta.href}
          className="mt-8 inline-flex rounded-full bg-ink-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-800"
        >
          {cta.label}
        </Link>
      </header>

      <motion.div style={{ rotateX: rotarX, rotateZ: rotarZ, translateY: desplazarY, opacity: opacidad }}>
        <motion.div className="mb-20 flex flex-row-reverse space-x-20 space-x-reverse">
          {fila1.map((item, i) => (
            <Tarjeta key={`f1-${i}-${item.title}`} item={item} desplazar={desplazar} />
          ))}
        </motion.div>

        <motion.div className="mb-20 flex flex-row space-x-20">
          {fila2.map((item, i) => (
            <Tarjeta key={`f2-${i}-${item.title}`} item={item} desplazar={desplazarInverso} />
          ))}
        </motion.div>

        <motion.div className="flex flex-row-reverse space-x-20 space-x-reverse">
          {fila3.map((item, i) => (
            <Tarjeta key={`f3-${i}-${item.title}`} item={item} desplazar={desplazar} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function Tarjeta({ item, desplazar }: { item: ParallaxItem; desplazar: MotionValue<number> }) {
  return (
    <motion.div
      style={{ x: desplazar }}
      whileHover={{ y: -20 }}
      className="group/tarjeta relative h-96 w-[30rem] shrink-0"
    >
      <Link href={item.href} className="block h-full w-full group-hover/tarjeta:shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
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
