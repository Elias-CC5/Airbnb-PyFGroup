'use client';

import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PricingCardProps {
  className?: string;
  /** La tarjeta destacada se eleva y lleva la insignia. */
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
  onSelect?: () => void;
}

const precio = (valor: number) =>
  new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);

/**
 * Tarjeta de plan. Misma estructura que el diseño de referencia —insignia,
 * icono, precio grande, lista con palomitas— pero con los componentes y la
 * paleta del proyecto en vez de shadcn: aquí no hay Radix ni tokens `primary`.
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
  onSelect,
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className={cn(
        'relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-300',
        popular
          ? 'border-2 border-ink-900 bg-white shadow-lg lg:-translate-y-2'
          : 'border-ink-200 bg-white shadow-xs',
        className,
      )}
    >
      {popular && (
        <span className="absolute right-8 top-0 -translate-y-1/2 rounded-full bg-ink-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
          Más elegido
        </span>
      )}

      <div className="mb-4 flex items-center gap-4">
        {icon && (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-900">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-xl font-bold text-ink-900">{planName}</h3>
          {description && <p className="text-sm text-ink-500">{description}</p>}
        </div>
      </div>

      <div className="my-6 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-ink-500">S/</span>
        <span className="text-5xl font-bold tracking-tight text-ink-900">{precio(price)}</span>
        <span className="text-sm text-ink-500">{billingCycle}</span>
      </div>

      <Button
        fullWidth
        size="lg"
        variant={isCurrentPlan ? 'outline' : popular ? 'secondary' : 'outline'}
        disabled={isCurrentPlan || loading}
        loading={loading}
        onClick={onSelect}
      >
        {isCurrentPlan ? 'Tu plan actual' : buttonText}
      </Button>

      <ul className="mt-8 flex-1 space-y-4 text-sm text-ink-600">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 size-5 shrink-0 text-ink-900" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
