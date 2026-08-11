'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, icon, suffix, ...props },
  ref,
) {
  return (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-11 w-full rounded-xl border border-ink-300 bg-white px-3.5 text-sm text-ink-900',
            'placeholder:text-ink-400 transition-colors duration-200',
            'hover:border-ink-400 focus:border-clay-500 focus:outline-none focus:ring-4 focus:ring-clay-500/10',
            'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400',
            icon && 'pl-10',
            suffix && 'pr-11',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10',
            className,
          )}
          {...props}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">{suffix}</span>}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger-700">{error}</p>}
    </div>
  );
});
