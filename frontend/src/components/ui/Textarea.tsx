'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, ...props },
  ref,
) {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full resize-y rounded-xl border border-ink-300 bg-white px-3.5 py-3 text-sm text-ink-900',
          'placeholder:text-ink-400 transition-colors duration-200 min-h-28',
          'hover:border-ink-400 focus:border-clay-500 focus:outline-none focus:ring-4 focus:ring-clay-500/10',
          error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger-700">{error}</p>}
    </div>
  );
});
