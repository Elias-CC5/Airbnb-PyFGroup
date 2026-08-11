import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

type Tone = 'neutral' | 'clay' | 'success' | 'warning' | 'danger' | 'dark';

const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 border-ink-200',
  clay: 'bg-clay-50 text-clay-700 border-clay-200',
  success: 'bg-success-50 text-success-700 border-success-500/20',
  warning: 'bg-warning-50 text-warning-700 border-warning-500/20',
  danger: 'bg-danger-50 text-danger-700 border-danger-500/20',
  dark: 'bg-ink-900 text-white border-ink-900',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
