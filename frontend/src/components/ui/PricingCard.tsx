'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PricingCardProps {
  className?: string;
  /** La tarjeta destacada lleva la insignia y el botón ámbar. */
  popular?: boolean;
  planName: string;
  description?: string | null;
  /** En soles. Se formatea aquí, no llega formateado. */
  price: number;
  billingCycle: string;
  features: string[];
  buttonText: string;
  isCurrentPlan?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  /** Posición en la fila: decide hacia dónde se inclina la tarjeta. */
  index?: number;
  onSelect?: () => void;
}

const precio = (valor: number) =>
  new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);

/** Cada tarjeta se tuerce distinto: alineadas parecen un error, no un estilo. */
const INCLINACION = ['-rotate-1', 'rotate-1', '-rotate-2'];

/**
 * Tarjeta de plan en estilo "cuaderno": borde grueso, sombra dura desplazada y
 * tipografía manuscrita.
 *
 * El diseño de referencia venía sobre shadcn —`Button` de Radix, tokens
 * `primary`, clases `dark:`—. Aquí no hay Radix ni modo oscuro, así que el
 * botón es un `<button>` con las mismas clases que el resto de la tarjeta: si
 * usara el `Button` del proyecto, sus bordes redondeados y su sombra suave
 * pelearían con la sombra dura.
 */
export function PricingCard({
  className,
  popular,
  planName,
  description,
  price,
  billingCycle,
  features,
  buttonText,
  isCurrentPlan = false,
  loading = false,
  icon,
  index = 0,
  onSelect,
}: PricingCardProps) {
  const bloqueado = isCurrentPlan || loading;

  return (
    <div
      className={cn(
        'group relative h-full transition-transform duration-300',
        INCLINACION[index % INCLINACION.length],
        className,
      )}
    >
      {/* El papel va en su propia capa: así la sombra crece al pasar el ratón
          sin arrastrar el contenido. */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg border-2 border-ink-900 bg-white',
          'shadow-[4px_4px_0px_0px] shadow-ink-900 transition-all duration-300',
          'group-hover:-translate-x-1 group-hover:-translate-y-1',
          'group-hover:shadow-[8px_8px_0px_0px]',
        )}
      />

      <div className="relative flex h-full flex-col p-6">
        {popular && (
          <span className="absolute -right-2 -top-2 rotate-12 rounded-full border-2 border-ink-900 bg-amber-400 px-3 py-1 font-handwritten text-sm text-ink-900">
            ¡El más elegido!
          </span>
        )}

        <div className="mb-6">
          {icon && (
            <span className="mb-4 grid size-12 place-items-center rounded-full border-2 border-ink-900 text-ink-900">
              {icon}
            </span>
          )}
          <h3 className="font-handwritten text-2xl text-ink-900">{planName}</h3>
          {description && <p className="font-handwritten text-ink-600">{description}</p>}
        </div>

        <div className="mb-6 font-handwritten">
          <span className="text-2xl text-ink-600">S/ </span>
          <span className="text-4xl font-bold text-ink-900">{precio(price)}</span>
          <span className="text-ink-600"> {billingCycle}</span>
        </div>

        <div className="mb-8 flex-1 space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 border-ink-900">
                <Check className="size-3" />
              </span>
              <span className="font-handwritten text-lg leading-snug text-ink-900">{feature}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={bloqueado}
          onClick={onSelect}
          className={cn(
            'relative h-12 w-full rounded-md border-2 border-ink-900 font-handwritten text-lg',
            'shadow-[4px_4px_0px_0px] shadow-ink-900 transition-all duration-300',
            'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px]',
            'disabled:pointer-events-none disabled:opacity-60',
            popular
              ? 'bg-amber-400 text-ink-900 hover:bg-amber-300 active:bg-amber-400'
              : 'bg-ink-50 text-ink-900 hover:bg-white active:bg-ink-50',
          )}
        >
          {isCurrentPlan ? 'Tu plan actual' : loading ? 'Un momento…' : buttonText}
        </button>
      </div>
    </div>
  );
}
