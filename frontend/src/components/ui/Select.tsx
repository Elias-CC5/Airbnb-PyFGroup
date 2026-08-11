'use client';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, error, children, ...props },
  ref,
) {
  return (
    <div className="w-full">
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-ink-300 bg-white pl-3.5 pr-10 text-sm text-ink-900',
            'transition-colors duration-200 hover:border-ink-400',
            'focus:border-clay-500 focus:outline-none focus:ring-4 focus:ring-clay-500/10',
            'disabled:cursor-not-allowed disabled:bg-ink-50',
            error && 'border-danger-500',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger-700">{error}</p>}
    </div>
  );
});
