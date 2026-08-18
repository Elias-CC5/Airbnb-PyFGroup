'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const FLAP_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!-:.";

const BOARD_ROWS = 4;
const BOARD_COLS = 18;

/** Pasos de mezcla antes de asentar el carácter. Pocos = fluido. */
const SCRAMBLE_MIN = 3;
const SCRAMBLE_MAX = 6;
const STEP_MS = 70;
const FLIP_MS = 160;
const COL_DELAY = 26;
const ROW_DELAY = 40;

/**
 * Animación en CSS, no en JS: framer-motion montando cuatro capas por paso
 * y por celda hacía inviable un tablero de este tamaño.
 */
const FLIP_KEYFRAMES = `
@keyframes flap-fall {
  from { transform: rotateX(0deg); }
  to   { transform: rotateX(-90deg); }
}
@media (prefers-reduced-motion: reduce) {
  .flap-anim { animation: none !important; }
}
`;

const CELL_TEXT_STYLE: React.CSSProperties = {
  fontSize: 'clamp(8px, 2.2vw, 24px)',
  lineHeight: 1,
};

const randomChar = () => FLAP_CHARS[1 + Math.floor(Math.random() * (FLAP_CHARS.length - 1))];

// ── Carácter individual ───────────────────────────────────────────────
const FlapCell = React.memo(
  function FlapCell({ target, delay }: { target: string; delay: number }) {
    // Un solo estado por celda: menos renders que cinco useState separados.
    const [state, setState] = useState({ ch: ' ', prev: ' ', flip: 0 });

    const chRef = useRef(' ');
    const tgtRef = useRef<string | null>(null);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
      timers.current.forEach(clearTimeout);
      timers.current = [];

      const normalized = FLAP_CHARS.includes(target.toUpperCase()) ? target.toUpperCase() : ' ';
      if (normalized === tgtRef.current) return;
      tgtRef.current = normalized;
      if (normalized === ' ' && chRef.current === ' ') return;

      const steps =
        normalized === ' '
          ? 2
          : SCRAMBLE_MIN + Math.floor(Math.random() * (SCRAMBLE_MAX - SCRAMBLE_MIN + 1));

      for (let i = 1; i <= steps; i++) {
        const isLast = i === steps;
        const t = setTimeout(
          () => {
            const ch = isLast ? normalized : randomChar();
            setState((s) => {
              chRef.current = ch;
              return { ch, prev: s.ch, flip: s.flip + 1 };
            });
          },
          delay + i * STEP_MS,
        );
        timers.current.push(t);
      }

      return () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        tgtRef.current = null;
      };
    }, [target, delay]);

    const show = state.ch === ' ' ? ' ' : state.ch;
    const showPrev = state.prev === ' ' ? ' ' : state.prev;

    const half =
      'absolute inset-x-0 flex select-none items-center justify-center font-mono font-bold text-neutral-800';

    return (
      <div className="flex aspect-[3/5] flex-col overflow-hidden rounded-[3px] border border-neutral-300">
        <div className="relative flex-1" style={{ perspective: '140px' }}>
          {/* Mitad superior */}
          <div className="absolute inset-x-0 top-0 h-[calc(50%-0.5px)] overflow-hidden rounded-t-[2px] bg-neutral-200/80">
            <div className={cn(half, 'top-0 h-[200%]')} style={CELL_TEXT_STYLE}>
              {show}
            </div>
          </div>

          {/* Mitad inferior */}
          <div className="absolute inset-x-0 bottom-0 h-[calc(50%-0.5px)] overflow-hidden rounded-b-[2px] bg-neutral-200/80">
            <div className={cn(half, 'bottom-0 h-[200%]')} style={CELL_TEXT_STYLE}>
              {show}
            </div>
          </div>

          {/* Solapa que cae con el carácter anterior. Un único elemento por paso. */}
          {state.flip > 0 && (
            <div
              key={state.flip}
              className="flap-anim absolute inset-x-0 top-0 z-10 h-[calc(50%-0.5px)] origin-bottom overflow-hidden rounded-t-[2px] bg-neutral-100"
              style={{
                animation: `flap-fall ${FLIP_MS}ms cubic-bezier(0.55,0.06,0.68,0.19) forwards`,
                backfaceVisibility: 'hidden',
              }}
            >
              <div className={cn(half, 'top-0 h-[200%]')} style={CELL_TEXT_STYLE}>
                {showPrev}
              </div>
            </div>
          )}

          {/* Línea divisoria */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-[0.5px] bg-neutral-400/50" />
        </div>
      </div>
    );
  },
  (a, b) => a.target === b.target && a.delay === b.delay,
);

// ── Ajuste de texto a la grilla ───────────────────────────────────────
function wrapParagraph(paragraph: string, maxCols: number): string[] {
  const lines: string[] = [];
  let currentLine = '';

  for (const word of paragraph.split(/[ \t]+/).filter(Boolean)) {
    if (word.length > maxCols) {
      if (currentLine) lines.push(currentLine);
      currentLine = '';
      lines.push(word.slice(0, maxCols));
      continue;
    }
    if (!currentLine) currentLine = word;
    else if (currentLine.length + 1 + word.length <= maxCols) currentLine += ' ' + word;
    else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function wrapText(input: string, maxCols: number): string[] {
  return input
    .split('\n')
    .flatMap((p) => (p.trim() === '' ? [''] : wrapParagraph(p.trim(), maxCols)));
}

// ── Tablero ───────────────────────────────────────────────────────────
export interface TextFlippingBoardProps {
  text?: string;
  className?: string;
}

export function TextFlippingBoard({ text = '', className }: TextFlippingBoardProps) {
  const board = useMemo(() => {
    const grid: string[][] = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => ' '),
    );

    const lines = wrapText(text, BOARD_COLS).slice(0, BOARD_ROWS);
    const startRow = Math.max(0, Math.floor((BOARD_ROWS - lines.length) / 2));

    lines.forEach((line, i) => {
      const row = startRow + i;
      if (row >= BOARD_ROWS) return;
      const startCol = Math.max(0, Math.floor((BOARD_COLS - line.length) / 2));
      [...line].forEach((ch, c) => {
        if (startCol + c < BOARD_COLS) grid[row][startCol + c] = ch;
      });
    });

    return grid;
  }, [text]);

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-2xl rounded-xl bg-neutral-100 p-2 shadow-lg md:rounded-2xl md:p-4',
        className,
      )}
    >
      <style>{FLIP_KEYFRAMES}</style>

      <div
        className="grid gap-px md:gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)` }}
      >
        {board.map((row, r) =>
          row.map((ch, c) => (
            <FlapCell key={`${r}-${c}`} target={ch} delay={c * COL_DELAY + r * ROW_DELAY} />
          )),
        )}
      </div>
    </div>
  );
}
