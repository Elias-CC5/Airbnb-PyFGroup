'use client';

import { Badge, Button, EmptyState, Modal, Spinner, Textarea } from '@/components/ui';
import { formatDate, formatPrice } from '@/lib/format';
import { queryKeys } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { adminPaymentsService, type PendingPayment } from '../services/host-plans.service';

const METODO: Record<string, string> = {
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFER: 'Transferencia',
  CASH: 'Efectivo',
};

export function PaymentsInbox() {
  const queryClient = useQueryClient();
  const [rechazando, setRechazando] = useState<PendingPayment | null>(null);
  const [motivo, setMotivo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.hostPayments({}),
    queryFn: () => adminPaymentsService.pending(),
  });

  const resolver = useMutation({
    mutationFn: ({ id, aprobar, razon }: { id: string; aprobar: boolean; razon?: string }) =>
      adminPaymentsService.review(id, aprobar, razon),
    onSuccess: (_r, vars) => {
      toast.success(vars.aprobar ? 'Pago confirmado, plan activo' : 'Pago rechazado');
      setRechazando(null);
      setMotivo('');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'host-payments'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const porRevisar = data?.items.filter((p) => p.status === 'IN_REVIEW') ?? [];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Pagos de anfitriones</h1>
        <p className="mt-1 text-sm text-ink-600">
          {porRevisar.length > 0
            ? `${porRevisar.length} ${porRevisar.length === 1 ? 'pago espera' : 'pagos esperan'} tu verificación`
            : 'No hay pagos por verificar'}
        </p>
      </header>

      {isLoading ? (
        <Spinner label="Cargando pagos…" />
      ) : !data?.items.length ? (
        <EmptyState
          icon={<Wallet className="size-6" />}
          title="Sin pagos pendientes"
          description="Cuando un anfitrión reporte un pago, aparecerá aquí y te llegará un correo."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Anfitrión</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 text-right font-medium">Monto</th>
                  <th className="px-5 py-3 font-medium">Operación</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.items.map((p) => {
                  const revisable = p.status === 'IN_REVIEW';

                  return (
                    <tr key={p.id} className="transition-colors hover:bg-ink-50/60">
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink-900">
                          {p.hostProfile.user.firstName} {p.hostProfile.user.lastName}
                        </p>
                        <p className="text-xs text-ink-500">{p.hostProfile.user.email}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {p.plan.name}
                        <span className="block text-xs text-ink-400">{p.plan.days} días</span>
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums text-ink-900">
                        {formatPrice(Number(p.amount))}
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {p.operationNumber ? (
                          <>
                            <span className="font-mono">{p.operationNumber}</span>
                            <span className="block text-xs text-ink-400">
                              {METODO[p.method ?? ''] ?? '—'}
                              {p.reportedAt ? ` · ${formatDate(p.reportedAt)}` : ''}
                            </span>
                          </>
                        ) : (
                          <span className="text-ink-400">Sin reportar</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={revisable ? 'warning' : 'neutral'}>
                          {revisable ? 'Por verificar' : 'Esperando pago'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {revisable && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRechazando(p)}
                            >
                              Rechazar
                            </Button>
                            <Button
                              size="sm"
                              disabled={resolver.isPending}
                              onClick={() => resolver.mutate({ id: p.id, aprobar: true })}
                            >
                              Confirmar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(rechazando)}
        onClose={() => setRechazando(null)}
        title="Rechazar el pago"
        description="El motivo se le envía por correo al anfitrión."
        footer={
          <>
            <Button variant="outline" onClick={() => setRechazando(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={motivo.trim().length < 10 || resolver.isPending}
              onClick={() =>
                rechazando &&
                resolver.mutate({ id: rechazando.id, aprobar: false, razon: motivo.trim() })
              }
            >
              Rechazar
            </Button>
          </>
        }
      >
        <Textarea
          rows={4}
          placeholder="Ej. No encuentro esa operación en la cuenta. Verifica el número."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <p className="mt-2 text-xs text-ink-500">Mínimo 10 caracteres.</p>
      </Modal>
    </div>
  );
}
