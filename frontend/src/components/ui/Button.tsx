'use client';

import { Slot } from './Slot';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-clay-600 text-white shadow-xs hover:bg-clay-700 active:bg-clay-800 disabled:bg-clay-300',
  secondary:
    'bg-ink-900 text-white shadow-xs hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-400',
  outline:
    'border border-ink-300 bg-white text-ink-900 hover:bg-ink-50 hover:border-ink-400 active:bg-ink-100',
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900',
  danger: 'bg-danger-700 text-white hover:brightness-110 active:brightness-95',
  link: 'text-clay-700 underline-offset-4 hover:underline p-0 h-auto',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-[10px]',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-2xl',
  icon: 'h-10 w-10 rounded-full',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, asChild, fullWidth, children, disabled, ...props },
  ref,
) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium whitespace-nowrap',
    'transition-[background-color,color,border-color,transform,opacity] duration-200',
    'disabled:pointer-events-none disabled:opacity-60 active:scale-[0.985]',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  );

  // Con `asChild` el hijo debe ser único: no inyectamos el spinner ni `disabled`
  // (que no es un atributo válido en un <a>).
  if (asChild) {
    return (
      <Slot ref={ref} className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button ref={ref} disabled={disabled || loading} className={classes} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});