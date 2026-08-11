'use client';

import { Keypad, SpeakerGrid, Trackpad } from '@/components/ui/macbook-scroll';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';

interface MacbookAuthProps {
  title?: ReactNode;
  children: ReactNode;
}

/**
 * Portátil cuya tapa se abre con el scroll. El lienzo queda pegado al viewport
 * durante todo el recorrido, así el equipo se mantiene centrado mientras gira.
 *
 * La tapa rota de -92° a 0°: al final está plana frente al usuario, sin
 * deformación, y sólo entonces el formulario se vuelve visible e interactivo.
 */
export function MacbookAuth({ title, children }: MacbookAuthProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [open, setOpen] = useState(false);

  const rotate = useTransform(scrollYProgress, [0.05, 0.5], [-92, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const formOpacity = useTransform(scrollYProgress, [0.42, 0.58], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => setOpen(value > 0.5));

  return (
    <section ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <motion.h1
          style={{ opacity: titleOpacity }}
          className="absolute top-24 px-6 text-center text-2xl font-bold text-ink-900 sm:text-3xl"
        >
          {title}
        </motion.h1>

        <div
          className="flex scale-[0.42] flex-col items-center sm:scale-[0.62] lg:scale-90 xl:scale-100"
          style={{ perspective: 1400 }}
        >
          {/* Tapa */}
          <motion.div
            style={{ rotateX: rotate, transformStyle: 'preserve-3d' }}
            className="h-[21rem] w-[32rem] origin-bottom rounded-t-2xl bg-[#010101] p-2 shadow-2xl"
          >
            <div className="size-full overflow-hidden rounded-lg bg-white">
              <motion.div
                style={{ opacity: formOpacity }}
                className={`flex size-full items-center justify-center overflow-y-auto px-10 py-8 ${
                  open ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                <div className="w-full max-w-[21rem]">{children}</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Base */}
          <div className="relative h-[22rem] w-[32rem] overflow-hidden rounded-b-2xl bg-[#272729]">
            <div className="relative h-10 w-full">
              <div className="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]" />
            </div>

            <div className="relative flex">
              <div className="mx-auto h-full w-[10%] overflow-hidden">
                <SpeakerGrid />
              </div>
              <div className="mx-auto h-full w-[80%]">
                <Keypad />
              </div>
              <div className="mx-auto h-full w-[10%] overflow-hidden">
                <SpeakerGrid />
              </div>
            </div>

            <Trackpad />

            <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
          </div>
        </div>

        {/* Pista de scroll mientras la tapa sigue cerrada */}
        <motion.p
          style={{ opacity: titleOpacity }}
          className="absolute bottom-10 text-xs uppercase tracking-[0.2em] text-ink-400"
        >
          Desliza para abrir
        </motion.p>
      </div>
    </section>
  );
}