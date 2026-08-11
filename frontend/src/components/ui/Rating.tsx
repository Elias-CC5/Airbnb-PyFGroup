'use client';

import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { useState } from 'react';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function Rating({ value, count, size = 'sm', showValue = true, className }: RatingProps) {
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4';

  if (!value) {
    return <span className={cn('text-sm text-ink-500', className)}>Nuevo</span>;
  }

  return (
    <span className={cn('inline-flex items-center gap-1 text-sm text-ink-800', className)}>
      <Star className={cn(iconSize, 'fill-clay-500 text-clay-500')} />
      {showValue && <span className="font-medium">{value.toFixed(1)}</span>}
      {count !== undefined && count > 0 && <span className="text-ink-500">({count})</span>}
    </span>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function RatingInput({ value, onChange, disabled }: RatingInputProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          disabled={disabled}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="rounded p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed"
        >
          <Star
            className={cn(
              'size-7 transition-colors',
              star <= active ? 'fill-clay-500 text-clay-500' : 'fill-ink-100 text-ink-300',
            )}
          />
        </button>
      ))}
    </div>
  );
}
