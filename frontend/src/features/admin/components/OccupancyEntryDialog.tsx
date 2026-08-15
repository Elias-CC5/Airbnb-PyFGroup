'use client';

import { Button, ConfirmDialog, Input, Label, Modal, Select, Textarea } from '@/components/ui';
import { RESERVATION_STATUS_LABEL } from '@/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  adminService,
  type BookingChannel,
  type OccupancyEntryPayload,
} from '../services/admin.service';

const CHANNEL_OPTIONS: Array<{ value: BookingChannel; label: string }> = [
  { value: 'DIRECT', label: 'Directo (P&F)' },
  { value: 'AIRBNB', label: 'Airbnb' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'EXPEDIA', label: 'Expedia / VRBO' },
  { value: 'TIKTOK', label: 'TikTok y Pág.' },
  { value: 'OTHER', label: 'Otros' },
];

export interface EntryDraft {
  reservationId?: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  channel: BookingChannel;
  status: string;
}

interface Props {
  draft: EntryDraft | null;
  onClose: () => void;
}

/** Alta y edición de una estadía desde el calendario. */
export function OccupancyEntryDialog({ draft, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EntryDraft | null>(draft);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => setForm(draft), [draft]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] });

  const save = useMutation({
    mutationFn: (values: EntryDraft) => {
      const payload: OccupancyEntryPayload = {
        propertyId: values.propertyId,
        guestName: values.guestName.trim(),
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        pricePerNight: Number(values.pricePerNight),
        channel: values.channel,
        status: values.status,
      };
      return values.reservationId
        ? adminService.updateEntry(values.reservationId, payload)
        : adminService.createEntry(payload);
    },
    onSuccess: () => {
      toast.success(form?.reservationId ? 'Estadía actualizada' : 'Estadía registrada');
      void refresh();
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminService.removeEntry(id),
    onSuccess: () => {
      toast.success('Estadía eliminada');
      setConfirmDelete(false);
      void refresh();
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!form) return null;

  const set = <K extends keyof EntryDraft>(key: K, value: EntryDraft[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const nights = Math.max(
    0,
    Math.round(
      (new Date(`${form.checkOut}T00:00:00Z`).getTime() -
        new Date(`${form.checkIn}T00:00:00Z`).getTime()) /
        86_400_000,
    ),
  );
  const invalid = !form.guestName.trim() || nights < 1;

  return (
    <>
      <Modal
        open={Boolean(draft)}
        onClose={onClose}
        title={form.reservationId ? 'Editar estadía' : 'Nueva estadía'}
        description={form.propertyTitle}
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            {form.reservationId ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                className="text-danger-700 hover:bg-danger-50"
              >
                <Trash2 className="size-4" /> Eliminar
              </Button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                loading={save.isPending}
                disabled={invalid}
                onClick={() => save.mutate(form)}
              >
                Guardar
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid gap-4">
          <div>
            <Label htmlFor="guestName" required>Huésped</Label>
            <Input
              id="guestName"
              value={form.guestName}
              placeholder="Nombre y apellido"
              onChange={(e) => set('guestName', e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="checkIn" required>Entrada</Label>
              <Input
                id="checkIn"
                type="date"
                value={form.checkIn}
                onChange={(e) => set('checkIn', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="checkOut" required>Salida</Label>
              <Input
                id="checkOut"
                type="date"
                value={form.checkOut}
                onChange={(e) => set('checkOut', e.target.value)}
              />
            </div>
          </div>

          <p className="-mt-2 text-xs text-ink-500">
            {nights > 0
              ? `${nights} noche(s) · total S/ ${(nights * Number(form.pricePerNight || 0)).toFixed(2)}`
              : 'La salida debe ser posterior a la entrada'}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pricePerNight" required>Precio por noche (S/)</Label>
              <Input
                id="pricePerNight"
                type="number"
                min={0}
                value={form.pricePerNight}
                onChange={(e) => set('pricePerNight', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="channel">Canal</Label>
              <Select
                id="channel"
                value={form.channel}
                onChange={(e) => set('channel', e.target.value as BookingChannel)}
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select id="status" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {Object.entries(RESERVATION_STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar esta estadía?"
        description="Se borrará del calendario y de la lista de reservas. No se puede deshacer."
        confirmLabel="Eliminar"
        loading={remove.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => form.reservationId && remove.mutate(form.reservationId)}
      />
    </>
  );
}
