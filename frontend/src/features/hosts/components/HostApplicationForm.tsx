'use client';

import { Button, Input, Label, Select, Textarea } from '@/components/ui';
import { queryKeys } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { hostService, type HostApplicationInput } from '../services/host.service';

const BORRADOR = 'pyfgroup:solicitud-anfitrion';

const PASOS = ['Sobre ti', 'Identidad', 'Tu espacio'] as const;

const VACIO: HostApplicationInput = {
  fullName: '',
  phone: '',
  documentType: 'DNI',
  documentNumber: '',
  occupation: '',
  motivation: '',
  city: '',
};

/**
 * Solicitud en tres pasos. El progreso se guarda en el navegador, así que si
 * el usuario cierra la pestaña a mitad de camino no pierde lo escrito.
 */
export function HostApplicationForm({ onCancel }: { onCancel: () => void }) {
  const queryClient = useQueryClient();
  const [paso, setPaso] = useState(0);
  const [valores, setValores] = useState<HostApplicationInput>(VACIO);
  const [cargado, setCargado] = useState(false);

  // Recuperar el borrador. Sólo al montar, y tolerante a JSON corrupto.
  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(BORRADOR);
      if (guardado) setValores({ ...VACIO, ...JSON.parse(guardado) });
    } catch {
      window.localStorage.removeItem(BORRADOR);
    }
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    window.localStorage.setItem(BORRADOR, JSON.stringify(valores));
  }, [valores, cargado]);

  const set = <K extends keyof HostApplicationInput>(campo: K, valor: HostApplicationInput[K]) =>
    setValores((v) => ({ ...v, [campo]: valor }));

  const enviar = useMutation({
    mutationFn: () =>
      hostService.apply({
        ...valores,
        occupation: valores.occupation?.trim() || undefined,
        city: valores.city?.trim() || undefined,
      }),
    onSuccess: (res) => {
      window.localStorage.removeItem(BORRADOR);
      toast.success(res.message);
      void queryClient.invalidateQueries({ queryKey: queryKeys.hosts.me });
      onCancel();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // ---------------------------- validación por paso ----------------------------
  const dniValido =
    valores.documentType !== 'DNI' || /^\d{8}$/.test(valores.documentNumber.replace(/\s/g, ''));

  const pasoValido = [
    valores.fullName.trim().length >= 5 && /^\+?[\d\s()-]{6,30}$/.test(valores.phone.trim()),
    valores.documentNumber.trim().length >= 6 && dniValido,
    valores.motivation.trim().length >= 30,
  ][paso];

  const progreso = Math.round(((paso + (pasoValido ? 1 : 0)) / PASOS.length) * 100);

  return (
    <div className="container-page py-16 sm:py-20">
      <div className="mx-auto max-w-xl">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft className="size-4" /> Volver
        </button>

        {/* ----------------------------- progreso ----------------------------- */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-ink-900">
              Paso {paso + 1} de {PASOS.length} · {PASOS[paso]}
            </p>
            <p className="text-xs text-ink-500">{progreso}%</p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-ink-900 transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {paso === 0 && (
            <>
              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  placeholder="Como aparece en tu documento"
                  value={valores.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+51 987 654 321"
                  value={valores.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="occupation">¿A qué te dedicas? (opcional)</Label>
                <Input
                  id="occupation"
                  placeholder="Arquitecto, comerciante, jubilado…"
                  value={valores.occupation ?? ''}
                  onChange={(e) => set('occupation', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">Ciudad (opcional)</Label>
                <Input
                  id="city"
                  placeholder="Lima"
                  value={valores.city ?? ''}
                  onChange={(e) => set('city', e.target.value)}
                />
              </div>
            </>
          )}

          {paso === 1 && (
            <>
              <div className="flex gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-500" />
                <p className="text-xs leading-relaxed text-ink-600">
                  Tu documento lo revisa una persona del equipo para confirmar tu identidad. Queda
                  registrado quién lo consulta, no aparece en tu perfil público y se elimina en
                  cuanto resolvemos tu solicitud.
                </p>
              </div>

              <div>
                <Label htmlFor="documentType">Tipo de documento</Label>
                <Select
                  id="documentType"
                  value={valores.documentType}
                  onChange={(e) =>
                    set('documentType', e.target.value as HostApplicationInput['documentType'])
                  }
                >
                  <option value="DNI">DNI</option>
                  <option value="CARNET_EXTRANJERIA">Carné de extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="documentNumber">Número</Label>
                <Input
                  id="documentNumber"
                  inputMode="numeric"
                  placeholder={valores.documentType === 'DNI' ? '8 dígitos' : 'Número del documento'}
                  value={valores.documentNumber}
                  onChange={(e) => set('documentNumber', e.target.value)}
                  error={
                    valores.documentNumber && !dniValido ? 'El DNI debe tener 8 dígitos' : undefined
                  }
                />
              </div>
            </>
          )}

          {paso === 2 && (
            <div>
              <Label htmlFor="motivation">¿Qué piensas publicar?</Label>
              <Textarea
                id="motivation"
                rows={6}
                placeholder="Cuéntanos qué alojamiento tienes, dónde queda y desde cuándo lo alquilas."
                value={valores.motivation}
                onChange={(e) => set('motivation', e.target.value)}
              />
              <p className="mt-2 text-xs text-ink-500">
                {valores.motivation.trim().length < 30
                  ? `Faltan ${30 - valores.motivation.trim().length} caracteres`
                  : 'Listo para enviar'}
              </p>
            </div>
          )}
        </div>

        {/* ------------------------------ acciones ----------------------------- */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            disabled={paso === 0}
            onClick={() => setPaso((p) => Math.max(0, p - 1))}
          >
            <ArrowLeft className="size-4" /> Atrás
          </Button>

          {paso < PASOS.length - 1 ? (
            <Button disabled={!pasoValido} onClick={() => setPaso((p) => p + 1)}>
              Continuar <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              disabled={!pasoValido || enviar.isPending}
              loading={enviar.isPending}
              onClick={() => enviar.mutate()}
            >
              Enviar solicitud
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          Guardamos tu progreso en este navegador. Puedes cerrar y continuar después.
        </p>
      </div>
    </div>
  );
}
