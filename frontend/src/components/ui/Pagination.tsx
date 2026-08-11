'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

/** Devuelve p. ej. [1, '…', 4, 5, 6, '…', 12] */
function buildRange(page: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: Array<number | '…'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) items.push('…');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < total - 1) items.push('…');
  items.push(total);

  return items;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={cn('flex items-center justify-center gap-1.5', className)} aria-label="Paginación">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className="grid size-10 place-items-center rounded-full border border-ink-300 text-ink-700 transition hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="size-4" />
      </button>

      {buildRange(page, totalPages).map((item, i) =>
        item === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-ink-400">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'size-10 rounded-full text-sm font-medium transition',
              item === page ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className="grid size-10 place-items-center rounded-full border border-ink-300 text-ink-700 transition hover:bg-ink-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
