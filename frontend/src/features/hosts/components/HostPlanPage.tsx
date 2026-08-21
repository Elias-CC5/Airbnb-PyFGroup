'use client';

import { Badge, Button, Input, Label, Modal, Select, Spinner } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { queryKeys } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, CalendarClock, Rocket, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PricingCard } from '@/components/ui/PricingCard';
import {
  hostPlansService,
  type HostPlan,
  type PaymentMethod,
} from '../services/host-plans.service';

const ICONOS = [<User key="u" className="size-5" />, <Rocket key="r" className="size-5" />, <Building2 key="b" className="size-5" />];

const METODOS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'YAPE', label: 'Yape' },
  { value: 'PLIN', label: 'Plin' },
  { value: 'TRANSFER', label: 'Transferencia bancaria' },
];

const contenedor = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const tarjeta = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function HostPlanPage() {
  const queryClient = useQueryClient();
  const [pagando, setPagando] = useState(false);
  const [metodo, setMetodo] = useState<PaymentMethod>('YAPE');
  const [operacion, setOperacion] = useState('');

  const { data: planes, isLoading: cargandoPlanes } = useQuery({
    queryKey: queryKeys.hosts.plans,
    queryFn: hostPlansService.plans,
  });

  const { data: miPlan, isLoading: cargandoPlan } = useQuery({
    queryKey: queryKeys.hosts.subscription,
    queryFn: hostPlansService.myPlan,
  });

  const refrescar = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.hosts.subscription });
    void queryClient.invalidateQueries({ queryKey: ['properties', 'mine'] });
  };

  const contratar = useMutation({
    mutationFn: (planId: string) => hostPlansService.subscribe(planId),
    onSuccess: () => {
      toast.success('Plan reservado. Ahora reporta tu pago.');
      refrescar();
      setPagando(true);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reportar = useMutation({
    mutationFn: () =>
      hostPlansService.reportPayment(miPlan!.pending!.id, {
        method: metodo,
        operationNumber: operacion.trim(),
      }),
    onSuccess: () => {
      toast.success('Pago reportado. Te avisamos apenas lo confirmemos.');
      setPagando(false);
      setOperacion('');
      refrescar();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cancelar = useMutation({
    mutationFn: (id: string) => hostPlansService.cancel(id),
    onSuccess: () => {
      toast.success('Plan cancelado');
      refrescar();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (cargandoPlanes || cargandoPlan) return <Spinner label="Cargando planes…" />;

  const pendiente = miPlan?.pending ?? null;
  const activo = miPlan?.subscription ?? null;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Mi plan</h1>
        <p className="mt-1 text-sm text-ink-600">
          Publica un alojamiento gratis. Para más de uno, elige un plan.
        </p>
      </header>

      {/* --------------------------- estado actual --------------------------- */}
      <EstadoActual
        miPlan={miPlan}
        onReportar={() => setPagando(true)}
        onCancelar={(id) => cancelar.mutate(id)}
        cancelando={cancelar.isPending}
      />

      {/* ------------------------------ planes ------------------------------ */}
      {!activo && (
        <section>
          <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-ink-500">
            {pendiente ? 'Otros planes' : 'Elige tu plan'}
          </h2>

          <motion.div
            variants={contenedor}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {(planes ?? []).map((plan, i) => (
              <motion.div key={plan.id} variants={tarjeta}>
                <PricingCard
                  popular={plan.isPopular}
                  planName={plan.name}
                  description={plan.tagline}
                  price={Number(plan.price)}
                  billingCycle={ciclo(plan)}
                  features={plan.features}
                  buttonText={pendiente ? 'Cambiar a este' : 'Contratar'}
                  icon={ICONOS[i % ICONOS.length]}
                  loading={contratar.isPending}
                  onSelect={() => {
                    if (pendiente) {
                      toast.error('Cancela primero el pago en curso');
                      return;
                    }
                    contratar.mutate(plan.id);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          <p className="mt-8 text-center text-xs text-ink-500">
            Los pagos se confirman a mano, normalmente el mismo día. No guardamos datos de tarjetas.
          </p>
        </section>
      )}

      {/* --------------------------- reportar pago --------------------------- */}
      <Modal
        open={pagando && Boolean(pendiente)}
        onClose={() => setPagando(false)}
        title="Reportar tu pago"
        description={pendiente ? `Plan ${pendiente.plan.name} · S/ ${Number(pendiente.amount)}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setPagando(false)}>
              Después
            </Button>
            <Button
              disabled={operacion.trim().length < 4 || reportar.isPending}
              loading={reportar.isPending}
              onClick={() => reportar.mutate()}
            >
              Ya pagué
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 text-sm">
            <p className="font-medium text-ink-900">Yapea o plinea a:</p>
            <p className="mt-1 font-mono text-lg text-ink-900">987 654 321</p>
            <p className="mt-1 text-xs text-ink-500">PyFGroup S.A.C.</p>
          </div>

          <div>
            <Label htmlFor="metodo">Con qué pagaste</Label>
            <Select
              id="metodo"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as PaymentMethod)}
            >
              {METODOS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="operacion">Número de operación</Label>
            <Input
              id="operacion"
              inputMode="numeric"
              placeholder="Aparece en la constancia de tu app"
              value={operacion}
              onChange={(e) => setOperacion(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-ink-500">
              Con ese número verificamos el pago. No lo compartas con nadie más.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ciclo(plan: HostPlan) {
  if (plan.days <= 31) return 'por 30 días';
  const meses = Math.round(plan.days / 30);
  return `por ${meses} meses`;
}

interface EstadoProps {
  miPlan?: Awaited<ReturnType<typeof hostPlansService.myPlan>>;
  onReportar: () => void;
  onCancelar: (id: string) => void;
  cancelando: boolean;
}

function EstadoActual({ miPlan, onReportar, onCancelar, cancelando }: EstadoProps) {
  if (!miPlan) return null;

  const { subscription, pending, properties, slotsLeft } = miPlan;

  if (subscription) {
    return (
      <div className="rounded-2xl border border-ink-900 bg-ink-900 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge tone="dark" className="border-white/30 bg-white/10 text-white">
              Plan activo
            </Badge>
            <p className="mt-3 text-xl font-semibold">{subscription.plan.name}</p>
            <p className="mt-1 text-sm text-white/70">
              {properties.published}{' '}
              {properties.published === 1 ? 'alojamiento publicado' : 'alojamientos publicados'} ·
              sin límite
            </p>
          </div>
          {subscription.endsAt && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-white/60">Vence</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-medium">
                <CalendarClock className="size-4" />
                {formatDate(subscription.endsAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (pending) {
    const enRevision = pending.status === 'IN_REVIEW';

    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <Badge tone={enRevision ? 'warning' : 'neutral'}>
          {enRevision ? 'Pago en revisión' : 'Falta tu pago'}
        </Badge>
        <p className="mt-3 text-lg font-semibold text-ink-900">Plan {pending.plan.name}</p>
        <p className="mt-1 text-sm text-ink-600">
          {enRevision
            ? `Reportaste la operación ${pending.operationNumber}. Te escribimos apenas la confirmemos.`
            : `S/ ${Number(pending.amount)} · reporta tu pago para activarlo.`}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {!enRevision && <Button onClick={onReportar}>Reportar pago</Button>}
          <Button
            variant="outline"
            disabled={cancelando}
            onClick={() => onCancelar(pending.id)}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6">
      <Badge>Plan gratuito</Badge>
      <p className="mt-3 text-lg font-semibold text-ink-900">
        {slotsLeft === 0
          ? 'Usaste tu alojamiento gratuito'
          : `Te queda ${slotsLeft} alojamiento gratis`}
      </p>
      <p className="mt-1 text-sm text-ink-600">
        {slotsLeft === 0
          ? 'Para publicar otro, elige un plan de abajo.'
          : 'Publica uno sin pagar nada. Cuando quieras más, elige un plan.'}
      </p>
    </div>
  );
}
