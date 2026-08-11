import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StackSectionProps {
  children: ReactNode;
  /** Orden en la pila: cuanto mayor, más al frente. */
  index: number;
  className?: string;
}

/**
 * Sección apilable: se queda fija arriba mientras la siguiente se desliza
 * por encima. El efecto sale de tres cosas — `sticky top-0`, un `z-index`
 * creciente y un fondo opaco con esquinas redondeadas.
 *
 * Requisito: ningún ancestro puede tener `overflow: hidden` ni `transform`,
 * o el `sticky` deja de funcionar.
 */
export function StackSection({ children, index, className }: StackSectionProps) {
  return (
    <section
      style={{ zIndex: index }}
      className={cn(
        'sticky top-0 min-h-screen overflow-hidden rounded-t-[40px]',
        'shadow-[0_-24px_70px_-24px_rgba(28,25,23,0.45)]',
        className,
      )}
    >
      {children}
    </section>
  );
}