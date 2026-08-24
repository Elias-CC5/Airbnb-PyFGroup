'use client';

import { Button, Input, Label, Select, Textarea } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Camera, ShieldCheck, Upload } from 'lucide-react';
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

/** Las tres fotos que pide la verificación. */
interface Fotos {
  front?: File;
  back?: File;
  selfie?: File;
}

const MAX_MB = 5;

/**
 * Campo de foto con vista previa.
 *
 * La vista previa no es adorno: la mitad de los rechazos de verificación son
 * fotos movidas o cortadas, y verla antes de enviar los evita.
 */
function CampoFoto({
  id,
  titulo,
  descripcion,
  icono,
  archivo,
  onElegir,
}: {
  id: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  archivo?: File;
  onElegir: (archivo?: File) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  // `createObjectURL` reserva memoria hasta que se revoca a mano.
  useEffect(() => {
    if (!archivo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  return (
    <div className="rounded-xl border border-ink-200 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-ink-400">{icono}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-900">{titulo}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{descripcion}</p>

          {preview ? (
            <div className="mt-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={titulo}
                className="h-16 w-24 rounded-lg border border-ink-200 object-cover"
              />
              <button
                type="button"
                onClick={() => onElegir(undefined)}
                className="text-xs text-ink-500 underline underline-offset-2 hover:text-ink-900"
              >
                Cambiar
              </button>
            </div>
          ) : (
            <label
              htmlFor={id}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-ink-300 px-3 py-1.5 text-xs text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
            >
              <Upload className="size-3.5" /> Elegir foto
            </label>
          )}

          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const elegido = e.target.files?.[0];
              if (!elegido) return;
              if (elegido.size > MAX_MB * 1024 * 1024) {
                toast.error(`La imagen supera los ${MAX_MB} MB. Envía una más liviana.`);
                return;
              }
              onElegir(elegido);
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Solicitud en tres pasos. El texto se guarda en el navegador, así que si el
 * usuario cierra la pestaña a mitad de camino no pierde lo escrito. Las fotos
 * no: un `File` no cabe en localStorage y hay que volver a elegirlas.
 */
export function HostApplicationForm({ onCancel }: { onCancel: () => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [paso, setPaso] = useState(0);
  const [valores, setValores] = useState<HostApplicationInput>(VACIO);
  const [fotos, setFotos] = useState<Fotos>({});
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
    mutationFn: async () => {
      // Primero las fotos: si la subida falla, el formulario sigue en pantalla.
      const urls = await hostService.uploadDocuments(fotos);

      return hostService.apply({
        ...valores,
        occupation: valores.occupation?.trim() || undefined,
        city: valores.city?.trim() || undefined,
        ...urls,
      });
    },
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

  const fotosCompletas = Boolean(fotos.front && fotos.back && fotos.selfie);

  const pasoValido = [
    valores.fullName.trim().length >= 5 &&
      /^\+?[\d\s()-]{6,30}$/.test(valores.phone.trim()) &&
      valores.city!.trim().length >= 3,
    valores.documentNumber.trim().length >= 6 && dniValido && fotosCompletas,
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
              <p className="text-sm leading-relaxed text-ink-600">
                Estos datos son los que ve el equipo al revisar tu solicitud. Escríbelos como
                figuran en tu documento: si no coinciden, la verificación se rechaza.
              </p>

              <div>
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  placeholder="Como aparece en tu documento"
                  value={valores.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                />
                <p className="mt-1.5 text-xs text-ink-500">Nombres y apellidos, sin abreviar.</p>
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+51 987 654 321"
                  value={valores.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
                <p className="mt-1.5 text-xs text-ink-500">
                  Con WhatsApp, si puede ser. Es por donde te contactamos y por donde te escriben
                  los huéspedes.
                </p>
              </div>

              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  placeholder="Lima"
                  value={valores.city ?? ''}
                  onChange={(e) => set('city', e.target.value)}
                />
                <p className="mt-1.5 text-xs text-ink-500">
                  Dónde vives tú. El alojamiento puede estar en otra ciudad.
                </p>
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

              {user?.email && (
                <p className="rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-600">
                  Te responderemos a <span className="font-medium text-ink-900">{user.email}</span>,
                  el correo de tu cuenta.
                </p>
              )}
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

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-900">Fotos del documento</p>

                <CampoFoto
                  id="doc-front"
                  titulo="Anverso"
                  descripcion="La cara con tu foto y tus datos. Sobre superficie plana, sin flash y sin dedos encima."
                  icono={<Upload className="size-4" />}
                  archivo={fotos.front}
                  onElegir={(f) => setFotos((v) => ({ ...v, front: f }))}
                />

                <CampoFoto
                  id="doc-back"
                  titulo="Reverso"
                  descripcion="La cara de atrás, completa y con los cuatro bordes visibles."
                  icono={<Upload className="size-4" />}
                  archivo={fotos.back}
                  onElegir={(f) => setFotos((v) => ({ ...v, back: f }))}
                />

                <CampoFoto
                  id="doc-selfie"
                  titulo="Selfie con el documento"
                  descripcion="Tu rostro sosteniendo el documento junto a la cara. Sirve para confirmar que eres tú."
                  icono={<Camera className="size-4" />}
                  archivo={fotos.selfie}
                  onElegir={(f) => setFotos((v) => ({ ...v, selfie: f }))}
                />

                <p className="text-xs text-ink-500">
                  JPG, PNG o WEBP · máximo {MAX_MB} MB cada una. Las tres son obligatorias.
                </p>
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
              {enviar.isPending ? 'Enviando fotos…' : 'Enviar solicitud'}
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          Guardamos lo que escribes en este navegador. Las fotos no: si cierras la pestaña habrá
          que elegirlas de nuevo.
        </p>
      </div>
    </div>
  );
}
