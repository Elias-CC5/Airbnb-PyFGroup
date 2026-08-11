import { cn } from '@/lib/utils';
import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label className={cn('mb-1.5 block text-sm font-medium text-ink-800', className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-clay-600">*</span>}
    </label>
  );
}
