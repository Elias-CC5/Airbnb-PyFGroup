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
import React, { useEffect, useRef } from 'react';
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
  

  // Transiciones adaptadas al nuevo alto y ancho
  const scaleX = useTransform(scrollYProgress, [0, 0.3], [1.15, 1]);
  const scaleY = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);
  const translate = useTransform(scrollYProgress, [0, 0.3], [0, 850]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div
      ref={ref}
      className="flex min-h-[250vh] w-full shrink-0 flex-col items-center justify-start pt-8 [perspective:1200px]"
    >
    <motion.h2
  style={{ translateY: textTransform, opacity: textOpacity }}
  className="mb-10 max-w-2xl text-center font-sans font-bold text-4xl leading-tight tracking-tight text-[#1A1A1A] md:text-5xl"
>
  {title}
</motion.h2>

      <Lid src={src} scaleX={scaleX} scaleY={scaleY} rotate={rotate} translate={translate}>
        {children}
      </Lid>

      {/* Base Gigante de la Laptop (w-[50rem] / 800px) */}
      <div className="relative -z-10 h-[30rem] w-[50rem] overflow-hidden rounded-3xl bg-[#272729]">
        <div className="relative h-12 w-full">
          <div className="absolute inset-x-0 mx-auto h-5 w-[80%] bg-[#050505]" />
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

        <div className="absolute inset-x-0 bottom-0 mx-auto h-3 w-32 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />

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
    <div className="relative [perspective:1200px]">
      {/* Tapa vista desde atrás */}
      <div
        style={{
          transform: 'perspective(1200px) rotateX(-25deg) translateZ(0px)',
          transformOrigin: 'bottom',
          transformStyle: 'preserve-3d',
        }}
        className="relative h-[18rem] w-[50rem] rounded-3xl bg-[#010101] p-3"
      >
        <div
          style={{ boxShadow: '0px 2px 0px 2px #171717 inset' }}
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#010101]"
        >
          <BrandMark />
        </div>
      </div>

      {/* Pantalla Gigante con Marco Negro */}
      <motion.div
        style={{
          scaleX,
          scaleY,
          rotateX: rotate,
          translateY: translate,
          transformStyle: 'preserve-3d',
          transformOrigin: 'top',
        }}
        className="absolute inset-0 h-[38rem] w-[50rem] overflow-hidden rounded-3xl border-[16px] border-black bg-black shadow-2xl"
      >
        <div className="relative flex size-full flex-col overflow-hidden rounded-xl bg-white">
          {children ? (
            <>
              {/* Barra superior estilo macOS */}
              <div className="relative z-25 flex shrink-0 items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-5 py-2.5">
                <span className="flex gap-2">
                  <span className="size-3 rounded-full bg-rose-400" />
                  <span className="size-3 rounded-full bg-amber-400" />
                  <span className="size-3 rounded-full bg-emerald-400" />
                </span>
                <span className="mx-auto rounded-md bg-white px-4 py-1 text-xs font-medium text-neutral-500 shadow-sm ring-1 ring-neutral-200/60">
                  localhost:3000/login
                </span>
              </div>

              {/* Contenido amplio del formulario */}
              <div className="flex size-full flex-1 flex-col overflow-y-auto px-10 py-8">
                <div className="m-auto w-full max-w-lg">{children}</div>
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
    className="mx-auto my-2 h-40 w-[40%] rounded-2xl"
    style={{ boxShadow: '0px 0px 1px 1px #00000020 inset' }}
  />
);

export const SpeakerGrid = () => (
  <div
    className="mt-3 flex h-52 gap-[2px] px-[0.5px]"
    style={{
      backgroundImage: 'radial-gradient(circle, #08080A 0.5px, transparent 0.5px)',
      backgroundSize: '4px 4px',
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
      '[transform:translateZ(0)] rounded-[6px] p-[0.5px] [will-change:transform]',
      backlit && 'bg-white/[0.2] shadow-xl shadow-white',
    )}
  >
    <div
      className={cn('flex h-9 w-9 items-center justify-center rounded-[5px] bg-[#0A090D]', className)}
      style={{ boxShadow: '0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset' }}
    >
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center text-[8px] text-neutral-200',
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

const BrandMark = () => (
  <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6 text-white" aria-hidden>
    <path
      d="M4 24.5 8.2 8h3.4l3 11.2L17.6 8h3.4L24.2 19.2 27.2 8h3.4L26.4 24.5h-3.5l-2.6-9.6-2.9 9.6h-3.3l-2.7-9.6-2.5 9.6H4Z"
      fill="currentColor"
    />
  </svg>
);

export const Keypad = () => {
  const icon = 'h-2.5 w-2.5';

  return (
    <div className="mx-2 h-full [transform:translateZ(0)] rounded-lg bg-[#050505] p-1.5 [will-change:transform]">
      <div className="mb-[3px] flex w-full shrink-0 gap-[3px]">
        <KBtn className="w-14 items-end justify-start pb-[3px] pl-[6px]" childrenClassName="items-start">
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
          <div className="h-5 w-5 rounded-full bg-gradient-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px">
            <div className="size-full rounded-full bg-black" />
          </div>
        </KBtn>
      </div>

      <div className="mb-[3px] flex w-full shrink-0 gap-[3px]">
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
        <KBtn className="w-14 items-end justify-end pb-[3px] pr-[6px]" childrenClassName="items-end">
          delete
        </KBtn>
      </div>

      <div className="mb-[3px] flex w-full shrink-0 gap-[3px]">
        <KBtn className="w-14 items-end justify-start pb-[3px] pl-[6px]" childrenClassName="items-start">
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

      <div className="mb-[3px] flex w-full shrink-0 gap-[3px]">
        <KBtn className="w-[4.2rem] items-end justify-start pb-[3px] pl-[6px]" childrenClassName="items-start">
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
        <KBtn className="w-[4.25rem] items-end justify-end pb-[3px] pr-[6px]" childrenClassName="items-end">
          return
        </KBtn>
      </div>

      <div className="mb-[3px] flex w-full shrink-0 gap-[3px]">
        <KBtn className="w-[5.4rem] items-end justify-start pb-[3px] pl-[6px]" childrenClassName="items-start">
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
        <KBtn className="w-[5.4rem] items-end justify-end pb-[3px] pr-[6px]" childrenClassName="items-end">
          shift
        </KBtn>
      </div>

      <div className="mb-[3px] flex w-full shrink-0 gap-[3px]">
        <KBtn childrenClassName="h-full justify-between py-[6px]">
          <div className="flex w-full justify-end pr-1">
            <span className="block">fn</span>
          </div>
          <div className="flex w-full justify-start pl-1">
            <IconWorld className={icon} />
          </div>
        </KBtn>
        <KBtn childrenClassName="h-full justify-between py-[6px]">
          <div className="flex w-full justify-end pr-1">
            <IconChevronUp className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">control</span>
          </div>
        </KBtn>
        <KBtn childrenClassName="h-full justify-between py-[6px]">
          <div className="flex w-full justify-end pr-1">
            <OptionKey className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">option</span>
          </div>
        </KBtn>
        <KBtn className="w-12" childrenClassName="h-full justify-between py-[6px]">
          <div className="flex w-full justify-end pr-1">
            <IconCommand className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">command</span>
          </div>
        </KBtn>

        <KBtn className="w-[12.8rem]" />

        <KBtn className="w-12" childrenClassName="h-full justify-between py-[6px]">
          <div className="flex w-full justify-start pl-1">
            <IconCommand className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">command</span>
          </div>
        </KBtn>
        <KBtn childrenClassName="h-full justify-between py-[6px]">
          <div className="flex w-full justify-start pl-1">
            <OptionKey className={icon} />
          </div>
          <div className="flex w-full justify-start pl-1">
            <span className="block">{`option`}</span>
          </div>
        </KBtn>

        <div className="mt-[3px] flex h-9 w-[7.3rem] flex-col items-center justify-end rounded-[6px] p-[0.5px]">
          <KBtn className="h-4 w-9">
            <IconCaretUpFilled className={icon} />
          </KBtn>
          <div className="flex">
            <KBtn className="h-4 w-9">
              <IconCaretLeftFilled className={icon} />
            </KBtn>
            <KBtn className="h-4 w-9">
              <IconCaretDownFilled className={icon} />
            </KBtn>
            <KBtn className="h-4 w-9">
              <IconCaretRightFilled className={icon} />
            </KBtn>
          </div>
        </div>
      </div>
    </div>
  );
};