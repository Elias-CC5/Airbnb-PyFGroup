'use client';

import { cn } from '@/lib/utils';
import {
  IconBrightnessDown,
  IconBrightnessUp,
  IconCaretDownFilled,
  IconCaretLeftFilled,
  IconCaretRightFilled,
  IconCaretUpFilled,
  IconChevronUp,
  IconCommand,
  IconMicrophone,
  IconMoon,
  IconPlayerSkipForward,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconSearch,
  IconTable,
  IconVolume,
  IconVolume2,
  IconVolume3,
  IconWorld,
} from '@tabler/icons-react';
import { MotionValue, motion, useScroll, useTransform } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

export const MacbookScroll = ({
  src,
  showGradient,
  title,
  badge,
  children,
}: {
  src?: string;
  showGradient?: boolean;
  title?: string | React.ReactNode;
  badge?: React.ReactNode;
  /** Si se pasa, ocupa la pantalla en lugar de la imagen. */
  children?: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window && window.innerWidth < 768) setIsMobile(true);
  }, []);

    const scaleX = useTransform(scrollYProgress, [0, 0.3], [1.2, 1]);

   const scaleY = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);

  const translate = useTransform(scrollYProgress, [0, 1], [0, 1500]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div
      ref={ref}
      // pt-32 deja hueco a la marca fija; antes el titular quedaba pegado al borde.
      className="flex min-h-[150vh] shrink-0 scale-[0.4] transform flex-col items-center justify-start pt-32 [perspective:800px] sm:scale-[0.6] md:scale-125 md:pt-44"
    >
      <motion.h2
        style={{ translateY: textTransform, opacity: textOpacity }}
        className="mb-14 text-center text-3xl font-bold text-ink-900"
      >
        {title}
      </motion.h2>

      <Lid src={src} scaleX={scaleX} scaleY={scaleY} rotate={rotate} translate={translate}>
        {children}
      </Lid>

      {/* Base */}
      <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-[#272729]">
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

        {showGradient && (
          <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-white via-white to-transparent" />
        )}

        {badge && <div className="absolute bottom-4 left-4">{badge}</div>}
      </div>
    </div>
  );
};

export const Lid = ({
  scaleX,
  scaleY,
  rotate,
  translate,
  src,
  children,
}: {
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  rotate: MotionValue<number>;
  translate: MotionValue<number>;
  src?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="relative [perspective:800px]">
      {/* Tapa vista desde atrás */}
      <div
        style={{
          transform: 'perspective(800px) rotateX(-25deg) translateZ(0px)',
          transformOrigin: 'bottom',
          transformStyle: 'preserve-3d',
        }}
        className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
      >
        <div
          style={{ boxShadow: '0px 2px 0px 2px #171717 inset' }}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
        >
          <BrandMark />
        </div>
      </div>

      {/* Pantalla que se abre con el scroll */}
      <motion.div
        style={{
          scaleX,
          scaleY,
          rotateX: rotate,
          translateY: translate,
          transformStyle: 'preserve-3d',
          transformOrigin: 'top',
        }}
        className="absolute inset-0 h-[28rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
      >
        <div className="absolute inset-0 overflow-hidden rounded-lg bg-white flex flex-col">
          {children ? (
            <>
              {/* Barra superior estilo macOS para anclar el diseño */}
              <div className="relative z-25 flex shrink-0 items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-4 py-2">
                <span className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[10px] font-medium text-neutral-500 shadow-sm ring-1 ring-neutral-200/60">
                  localhost:3000/login
                </span>
              </div>

              {/* Contenedor con scroll interno para que el footer y el contenido queden dentro y no se corten */}
              <div className="flex size-full flex-1 flex-col overflow-y-auto px-8 py-6">
                <div className="m-auto w-full max-w-[26rem]">{children}</div>
              </div>
            </>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={src} alt="" className="size-full object-cover object-left-top" />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const Trackpad = () => (
  <div
    className="mx-auto my-1 h-32 w-[40%] rounded-xl"
    style={{ boxShadow: '0px 0px 1px 1px #00000020 inset' }}
  />
);

export const SpeakerGrid = () => (
  <div
    className="mt-2 flex h-40 gap-[2px] px-[0.5px]"
    style={{
      backgroundImage: 'radial-gradient(circle, #08080A 0.5px, transparent 0.5px)',
      backgroundSize: '3px 3px',
    }}
  />
);

export const KBtn = ({
  className,
  children,
  childrenClassName,
  backlit = true,
}: {
  className?: string;
  children?: React.ReactNode;
  childrenClassName?: string;
  backlit?: boolean;
}) => (
  <div
    className={cn(
      '[transform:translateZ(0)] rounded-[4px] p-[0.5px] [will-change:transform]',
      backlit && 'bg-white/[0.2] shadow-xl shadow-white',
    )}
  >
    <div
      className={cn('flex h-6 w-6 items-center justify-center rounded-[3.5px] bg-[#0A090D]', className)}
      style={{ boxShadow: '0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset' }}
    >
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center text-[5px] text-neutral-200',
          childrenClassName,
          backlit && 'text-white',
        )}
      >
        {children}
      </div>
    </div>
  </div>
);

export const OptionKey = ({ className }: { className: string }) => (
  <svg fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect stroke="currentColor" strokeWidth={2} x="18" y="5" width="10" height="2" />
    <polygon
      stroke="currentColor"
      strokeWidth={2}
      points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 "
    />
    <rect width="32" height="32" stroke="none" />
  </svg>
);

/** Monograma de la marca en la tapa. */
const BrandMark = () => (
  <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4 text-white" aria-hidden>
    <path
      d="M4 24.5 8.2 8h3.4l3 11.2L17.6 8h3.4L24.2 19.2 27.2 8h3.4L26.4 24.5h-3.5l-2.6-9.6-2.9 9.6h-3.3l-2.7-9.6-2.5 9.6H4Z"
      fill="currentColor"
    />
  </svg>
);

export const Keypad = () => {
  const icon = 'h-[6px] w-[6px]';

  return (
    <div className="mx-1 h-full [transform:translateZ(0)] rounded-md bg-[#050505] p-1 [will-change:transform]">
      {/* Fila de función */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn className="w-10 items-end justify-start pb-[2px] pl-[4px]" childrenClassName="items-start">
          esc
        </KBtn>
        {(
          [
            [IconBrightnessDown, 'F1'],
            [IconBrightnessUp, 'F2'],
            [IconTable, 'F3'],
            [IconSearch, 'F4'],
            [IconMicrophone, 'F5'],
            [IconMoon, 'F6'],
            [IconPlayerTrackPrev, 'F7'],
            [IconPlayerSkipForward, 'F8'],
            [IconPlayerTrackNext, 'F9'],
            [IconVolume3, 'F10'],
            [IconVolume2, 'F11'],
            [IconVolume, 'F12'],
          ] as const
        ).map(([Icon, label]) => (
          <KBtn key={label}>
            <Icon className={icon} />
            <span className="mt-1 inline-block">{label}</span>
          </KBtn>
        ))}
        <KBtn>
          <div className="h-4 w-4 rounded-full bg-gradient-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px">
            <div className="size-full rounded-full bg-black" />
          </div>
        </KBtn>
      </div>

      {/* Números */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        {[
          ['~', '`'],
          ['!', '1'],
          ['@', '2'],
          ['#', '3'],
          ['$', '4'],
          ['%', '5'],
          ['^', '6'],
          ['&', '7'],
          ['*', '8'],
          ['(', '9'],
          [')', '0'],
          ['—', '_'],
          ['+', '='],
        ].map(([top, bottom]) => (
          <KBtn key={bottom}>
            <span className="block">{top}</span>
            <span className="block">{bottom}</span>
          </KBtn>
        ))}
        <KBtn className="w-10 items-end justify-end pb-[2px] pr-[4px]" childrenClassName="items-end">
          delete
        </KBtn>
      </div>

      {/* QWERTY */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn className="w-10 items-end justify-start pb-[2px] pl-[4px]" childrenClassName="items-start">
          tab
        </KBtn>
        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
          <KBtn key={key}>
            <span className="block">{key}</span>
          </KBtn>
        ))}
        {[
          ['{', '['],
          ['}', ']'],
          ['|', '\\'],
        ].map(([top, bottom]) => (
          <KBtn key={bottom}>
            <span className="block">{top}</span>
            <span className="block">{bottom}</span>
          </KBtn>
        ))}
      </div>

      {/* ASDF */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn className="w-[2.8rem] items-end justify-start pb-[2px] pl-[4px]" childrenClassName="items-start">
          caps lock
        </KBtn>
        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
          <KBtn key={key}>
            <span className="block">{key}</span>
          </KBtn>
        ))}
        {[
          [':', ';'],
          ['"', "'"],
        ].map(([top, bottom]) => (
          <KBtn key={bottom}>
            <span className="block">{top}</span>
            <span className="block">{bottom}</span>
          </KBtn>
        ))}
        <KBtn className="w-[2.85rem] items-end justify-end pb-[2px] pr-[4px]" childrenClassName="items-end">
          return
        </KBtn>
      </div>

      {/* ZXCV */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn className="w-[3.65rem] items-end justify-start pb-[2px] pl-[4px]" childrenClassName="items-start">
          shift
        </KBtn>
        {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
          <KBtn key={key}>
            <span className="block">{key}</span>
          </KBtn>
        ))}
        {[
          ['<', ','],
          ['>', '.'],
          ['?', '/'],
        ].map(([top, bottom]) => (
          <KBtn key={bottom}>
            <span className="block">{top}</span>
            <span className="block">{bottom}</span>
          </KBtn>
        ))}
        <KBtn className="w-[3.65rem] items-end justify-end pb-[2px] pr-[4px]" childrenClassName="items-end">
          shift
        </KBtn>
      </div>

      {/* Modificadores */}
      <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
        <KBtn childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1">
            <span className="block">fn</span>
          </div>
          <div className="flex w-full justify-start pl-1">
            <IconWorld className={icon} />
          </div>
        </KBtn>
        <KBtn childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1">
            <IconChevronUp className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">control</span>
          </div>
        </KBtn>
        <KBtn childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1">
            <OptionKey className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">option</span>
          </div>
        </KBtn>
        <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-end pr-1">
            <IconCommand className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">command</span>
          </div>
        </KBtn>

        <KBtn className="w-[8.2rem]" />

        <KBtn className="w-8" childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-start pl-1">
            <IconCommand className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">command</span>
          </div>
        </KBtn>
        <KBtn childrenClassName="h-full justify-between py-[4px]">
          <div className="flex w-full justify-start pl-1">
            <OptionKey className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">{`option`}</span>
          </div>
        </KBtn>

        <div className="mt-[2px] flex h-6 w-[4.9rem] flex-col items-center justify-end rounded-[4px] p-[0.5px]">
          <KBtn className="h-3 w-6">
            <IconCaretUpFilled className={icon} />
          </KBtn>
          <div className="flex">
            <KBtn className="h-3 w-6">
              <IconCaretLeftFilled className={icon} />
            </KBtn>
            <KBtn className="h-3 w-6">
              <IconCaretDownFilled className={icon} />
            </KBtn>
            <KBtn className="h-3 w-6">
              <IconCaretRightFilled className={icon} />
            </KBtn>
          </div>
        </div>
      </div>
    </div>
  );
};