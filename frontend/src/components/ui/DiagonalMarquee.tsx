'use client';

import { cn } from '@/lib/utils';

export interface MarqueeCard {
  id: string | number;
  url: string;
  title: string;
}

interface DiagonalMarqueeProps {
  cards: MarqueeCard[];
  angle?: number;
  baseSpeed?: number;
  className?: string;
}

const KEYFRAMES = `
@keyframes wasi-marquee-left  { from { transform: translate3d(0,0,0); }      to { transform: translate3d(-50%,0,0); } }
@keyframes wasi-marquee-right { from { transform: translate3d(-50%,0,0); }   to { transform: translate3d(0,0,0); } }
`;

function Row({ cards, speed, reverse }: { cards: MarqueeCard[]; speed: number; reverse: boolean }) {
  return (
    <div className="flex w-full overflow-hidden">
      <div
        className="flex shrink-0"
        style={{
          animationName: reverse ? 'wasi-marquee-right' : 'wasi-marquee-left',
          animationDuration: `${speed}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {cards.map((card, index) => (
              <div
                key={`${card.id}-${copy}-${index}`}
                className="relative mr-6 h-[190px] w-[280px] shrink-0 overflow-hidden rounded-xl shadow-lg lg:h-[240px] lg:w-[340px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.url} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-ink-950/15" />
                <span className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-wider text-white drop-shadow">
                  {card.title}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DiagonalMarquee({
  cards,
  angle = -22,
  baseSpeed = 130,
  className,
}: DiagonalMarqueeProps) {
  if (!cards.length) return null;

  const forward = [...cards, ...cards, ...cards];
  const backward = [...forward].reverse();

  const rows = [
    { cards: forward, speed: baseSpeed, reverse: false },
    { cards: backward, speed: Math.max(baseSpeed - 15, 30), reverse: true },
    { cards: forward, speed: baseSpeed + 15, reverse: false },
    { cards: backward, speed: Math.max(baseSpeed - 6, 35), reverse: true },
    { cards: forward, speed: baseSpeed + 24, reverse: false },
  ];

  return (
    <div aria-hidden className={cn('relative size-full overflow-hidden bg-white', className)}>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div
        className="absolute left-1/2 top-1/2 flex w-[220vw] flex-col gap-6"
        style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
      >
        {rows.map((row, index) => (
          <Row key={index} {...row} />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white via-white/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white via-white/55 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/90 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/90 to-transparent" />
    </div>
  );
}