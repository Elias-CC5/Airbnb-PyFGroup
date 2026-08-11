'use client';

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * Mini implementación de Slot (patrón `asChild`) para no depender de Radix.
 * Fusiona className y props sobre el único hijo válido.
 */
export const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Slot(
  { children, className, ...props },
  ref,
) {
  const child = Children.toArray(children).find(isValidElement) as
    | ReactElement<{ className?: string }>
    | undefined;

  if (!child) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('<Slot> (asChild) necesita exactamente un elemento React como hijo.');
    }
    return null;
  }

  return cloneElement(child, {
    ...props,
    ...(child.props as Record<string, unknown>),
    ref,
    className: cn(className, child.props.className),
  } as Record<string, unknown>);
});