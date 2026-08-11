import { SITE } from '@/constants';
import { cn } from '@/lib/utils';

/** Marca propia: monograma geométrico inspirado en la textilería andina. */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
        <rect width="32" height="32" rx="9" fill="var(--color-clay-600)" />
        <path d="M8 21.5 11.2 11h2.6l2.2 7.1L18.2 11h2.6L24 21.5h-2.7l-1.7-6.2-1.9 6.2h-2.4l-1.9-6.2-1.7 6.2H8Z" fill="white" />
      </svg>
      {!compact && (
        <span className="text-[1.05rem] font-semibold tracking-tight text-ink-900">{SITE.name}</span>
      )}
    </span>
  );
}
