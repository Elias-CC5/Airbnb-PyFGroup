'use client';

import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Pagination,
  Spinner,
  Textarea,
} from '@/components/ui';
import { formatDate } from '@/lib/format';
import { queryKeys } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Inbox, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  hostsAdminService,
  type HostApplication,
  type HostApplicationStatus,
} from '../services/hosts.service';

const ESTADO: Record<HostApplicationStatus, { label: string; tone: 'warning' | 'success' | 'danger' | 'neutral' }> = {
  SUBMITTED: { label: 'Por revisar', tone: 'warning' },
  UNDER_REVIEW: { label: 'En revisión', tone: 'warning' },
  APPROVED: { label: 'Aprobada', tone: 'success' },
  REJECTED: { label: 'Rechazada', tone: 'danger' },
};

const DOCUMENTO: Record<string, string> = {
  DNI: 'DNI',
  CARNET_EXTRANJERIA: 'Carné de extranjería',
  PASAPORTE: 'Pasaporte',
};

const FILTROS: Array<{ value: HostApplicationStatus | ''; label: string }> = [
  { value: 'SUBMITTED', label: 'Por revisar' },
  { value: 'APPROVED', label: 'Aprobadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
  { value: '', label: 'Todas' },
];

export function HostApplicationsInbox() {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<HostApplicationStatus | ''>('SUBMITTED');
  const [page, setPage] = useState(1);
  const [detalle, setDetalle] = useState<HostApplication | null>(null);
  const [rechazando, setRechazando] = useState<HostApplication | null>(null);
  const [motivo, setMotivo] = useState('');

  const filtros = { page, limit: 10, ...(status ? { status } : {}) };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.hostApplications(filtros),
    queryFn: () => hostsAdminService.applications(filtros),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'host-applications'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'hosts'] });
  };

  const resolver = useMutation({
    mutationFn: ({ id, aprobar, razon }: { id: string; aprobar: boolean; razon?: string }) =>
      hostsAdminService.review(id, aprobar ? 'APPROVED' : 'REJECTED', razon),
    onSuccess: (_res, vars) => {
      toast.success(vars.aprobar ? 'Anfitrión aprobado' : 'Solicitud rechazada');
      setDetalle(null);
      setRechazando(null);
      setMotivo('');
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const porRevisar = data?.items.filter((a) => a.status === 'SUBMITTED').length ?? 0;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Solicitudes de anfitrión</h1>
        <p className="mt-1 text-sm text-ink-600">
          {porRevisar > 0
            ? `${porRevisar} ${porRevisar === 1 ? 'solicitud espera' : 'solicitudes esperan'} tu revisión`
            : 'No hay solicitudes pendientes'}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              status === f.value
                ? 'border-ink-900 bg-ink-900 text-white'
                : 'border-ink-200 text-ink-600 hover:bg-ink-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner label="Cargando solicitudes…" />
      ) : !data?.items.length ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title="Sin solicitudes"
          description="Cuando alguien pida ser anfitrión, aparecerá aquí y te llegará un correo."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Solicitante</th>
                  <th className="px-5 py-3 font-medium">Ciudad</th>
                  <th className="px-5 py-3 font-medium">Enviada</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.items.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-ink-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">{a.fullName}</p>
                      <p className="text-xs text-ink-500">{a.user.email}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{a.city ?? '—'}</td>
                    <td className="px-5 py-3 text-ink-600">{formatDate(a.submittedAt)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={ESTADO[a.status].tone}>{ESTADO[a.status].label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setDetalle(a)}>
                        Revisar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.pages > 1 && (
        <Pagination page={page} totalPages={data.pages} onChange={setPage} />
      )}

      <DetalleSolicitud
        application={detalle}
        onClose={() => setDetalle(null)}
        onApprove={(id) => resolver.mutate({ id, aprobar: true })}
        onReject={(a) => {
          setDetalle(null);
          setRechazando(a);
        }}
        loading={resolver.isPending}
      />

      <Modal
        open={Boolean(rechazando)}
        onClose={() => setRechazando(null)}
        title="Rechazar solicitud"
        description="El motivo se le enviará por correo, así que escríbelo pensando en que lo va a leer."
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
          placeholder="Ej. Las fotos del documento están borrosas, no se lee el número."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <p className="mt-2 text-xs text-ink-500">Mínimo 10 caracteres.</p>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface DetalleProps {
  application: HostApplication | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (a: HostApplication) => void;
  loading: boolean;
}

function DetalleSolicitud({ application, onClose, onApprove, onReject, loading }: DetalleProps) {
  const [verDocumentos, setVerDocumentos] = useState(false);
  const pendiente = application?.status === 'SUBMITTED' || application?.status === 'UNDER_REVIEW';

  // Los documentos sólo se piden cuando el admin lo decide: cada consulta
  // queda registrada en el backend con su nombre y su IP.
  const { data: documentos, isLoading: cargandoDocs } = useQuery({
    queryKey: queryKeys.admin.hostDocuments(application?.id ?? ''),
    queryFn: () => hostsAdminService.documents(application!.id),
    enabled: Boolean(application) && verDocumentos,
  });

  return (
    <Modal
      open={Boolean(application)}
      onClose={() => {
        setVerDocumentos(false);
        onClose();
      }}
      title={application?.fullName}
      description={application ? `Solicitud del ${formatDate(application.submittedAt)}` : undefined}
      size="lg"
      footer={
        pendiente ? (
          <>
            <Button variant="outline" onClick={() => application && onReject(application)}>
              Rechazar
            </Button>
            <Button
              disabled={loading}
              onClick={() => application && onApprove(application.id)}
            >
              Aprobar como anfitrión
            </Button>
          </>
        ) : undefined
      }
    >
      {application && (
        <div className="space-y-5 text-sm">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Dato label="Correo de la cuenta" valor={application.user.email} />
            <Dato label="Teléfono" valor={application.phone} />
            <Dato label="Ocupación" valor={application.occupation ?? '—'} />
            <Dato label="Ciudad" valor={application.city ?? '—'} />
            <Dato label="Tipo de documento" valor={DOCUMENTO[application.documentType]} />
            <Dato label="Cuenta creada" valor={formatDate(application.user.createdAt)} />
          </dl>

          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Qué quiere publicar</p>
            <p className="mt-1.5 whitespace-pre-line text-ink-800">{application.motivation}</p>
          </div>

          {application.status === 'REJECTED' && application.rejectionReason && (
            <div className="rounded-xl border border-danger-500/20 bg-danger-50 p-4">
              <p className="text-xs uppercase tracking-wide text-danger-700">Motivo del rechazo</p>
              <p className="mt-1 text-ink-800">{application.rejectionReason}</p>
            </div>
          )}

          {/* --------------------------- identidad --------------------------- */}
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-ink-500" />
              <div className="flex-1">
                <p className="font-medium text-ink-900">Documento de identidad</p>
                <p className="mt-1 text-xs text-ink-600">
                  Son datos personales. Al abrirlos queda registrado tu nombre y tu IP, y el
                  solicitante puede pedir ese historial. Ábrelos sólo si vas a verificarlo ahora.
                </p>

                {application.documentsPurgedAt ? (
                  <p className="mt-3 text-xs text-ink-500">
                    Las imágenes se eliminaron al resolver la solicitud, el{' '}
                    {formatDate(application.documentsPurgedAt)}.
                  </p>
                ) : !verDocumentos ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setVerDocumentos(true)}
                  >
                    <Eye className="size-4" /> Ver documento
                  </Button>
                ) : cargandoDocs ? (
                  <p className="mt-3 text-xs text-ink-500">Cargando…</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    <p className="font-mono text-ink-900">
                      {DOCUMENTO[documentos?.documentType ?? 'DNI']} {documentos?.documentNumber}
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Foto url={documentos?.documentFrontUrl} etiqueta="Anverso" />
                      <Foto url={documentos?.documentBackUrl} etiqueta="Reverso" />
                      <Foto url={documentos?.selfieUrl} etiqueta="Selfie" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-1 text-ink-900">{valor}</dd>
    </div>
  );
}

function Foto({ url, etiqueta }: { url?: string | null; etiqueta: string }) {
  if (!url) {
    return (
      <div className="grid h-28 place-items-center rounded-lg border border-dashed border-ink-300 text-xs text-ink-400">
        Sin {etiqueta.toLowerCase()}
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="group block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={etiqueta}
        className="h-28 w-full rounded-lg border border-ink-200 object-cover transition group-hover:opacity-90"
      />
      <span className="mt-1 block text-xs text-ink-500">{etiqueta}</span>
    </a>
  );
}
