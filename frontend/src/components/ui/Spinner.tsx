import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-live="polite">
      <Loader2 className={cn('size-6 animate-spin text-clay-600', className)} />
      {label && <p className="text-sm text-ink-500">{label}</p>}
    </div>
  );
}
