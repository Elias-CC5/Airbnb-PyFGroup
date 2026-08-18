'use client';

import { WordsPullUp } from '@/components/ui/prisma-hero';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {
  /** Foto de portada; normalmente la del alojamiento destacado. */
  backgroundUrl?: string;
  /** Cifras reales del catálogo. Si no llegan, no se muestran. */
  stays?: number;
  regions?: number;
}

const FALLBACK_BG = 'https://picsum.photos/seed/pyfgroup-hero/1920/1080';

export function Hero({ backgroundUrl, stays, regions }: HeroProps) {
  const showStats = Boolean(stays || regions);

  return (
    // El padding superior deja sitio a la barra flotante: así la tarjeta se ve
    // completa, con sus esquinas redondeadas, en vez de cortada por arriba.
    <section className="relative z-20 h-screen w-full p-2 pt-[92px] md:p-3 md:pt-[104px]">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <Image
          src={backgroundUrl ?? FALLBACK_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Oscurecido para que el texto blanco tenga contraste suficiente */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/80" />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-7 md:px-10 md:pb-8">
          <div className="grid grid-cols-12 items-end gap-6">
            {/* Titular gigante */}
            <div className="col-span-12 lg:col-span-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                Alojamientos con alma peruana
              </p>
              <h1 className="font-bold leading-[0.82] tracking-[-0.06em] text-white text-[24vw] sm:text-[22vw] lg:text-[17vw]">
                <WordsPullUp text="Perú" showAsterisk />
              </h1>
            </div>

            {/* Bajada, CTA y cifras */}
            <div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-5 lg:pb-10">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md text-sm leading-snug text-white/80 sm:text-base"
              >
                Casas, departamentos y cabañas verificadas una por una. Reserva en línea, paga en
                soles y coordina directo con el anfitrión.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/alojamientos"
                  className="group inline-flex items-center gap-2 self-start rounded-full bg-white py-1 pl-5 pr-1 text-sm font-medium text-ink-900 transition-all hover:gap-3 sm:text-base"
                >
                  Explorar alojamientos
                  <span className="flex size-9 items-center justify-center rounded-full bg-ink-900 transition-transform group-hover:scale-110 sm:size-10">
                    <ArrowRight className="size-4 text-white" />
                  </span>
                </Link>

                <Link
                  href="/destinos"
                  className="text-sm text-white/70 underline underline-offset-4 transition hover:text-white"
                >
                  Ver destinos
                </Link>
              </motion.div>

              {showStats && (
                <motion.dl
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="flex gap-8 border-t border-white/20 pt-4 text-white"
                >
                  {stays ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-white/60">
                        Alojamientos
                      </dt>
                      <dd className="text-xl font-bold">{stays}</dd>
                    </div>
                  ) : null}
                  {regions ? (
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-white/60">
                        Regiones
                      </dt>
                      <dd className="text-xl font-bold">{regions}</dd>
                    </div>
                  ) : null}
                </motion.dl>
              )}

              <p className="text-[11px] text-white/50">
                * y donde quieras ir dentro de él.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
