'use client';

import { Button, Input, Label, Select, Textarea } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { complaintsService } from '../services/complaints.service';
import { complaintSchema, type ComplaintInput } from '../schemas/complaint.schema';
import { CheckCircle2 } from 'lucide-react';

export function ComplaintForm() {
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplaintInput>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { type: 'RECLAMO', docType: 'DNI' },
  });

  const submit = useMutation({
    mutationFn: (values: ComplaintInput) =>
      complaintsService.create({
        ...values,
        amount: values.amount ? Number(values.amount) : undefined,
      }),
    onSuccess: (result) => {
      setSuccessCode(result.code);
      reset();
    },
  });

  if (successCode) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="size-10 text-emerald-600" />
        <div>
          <p className="text-lg font-semibold text-ink-900">Reclamo registrado</p>
          <p className="mt-1 text-sm text-ink-600">
            Tu código de seguimiento es <span className="font-mono font-semibold">{successCode}</span>.
            Te responderemos en un plazo máximo de 30 días calendario, según lo establecido por el Código de
            Protección y Defensa del Consumidor.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSuccessCode(null)}>
          Registrar otro reclamo
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => submit.mutate(v))} className="space-y-6" noValidate>
      {/* Tipo */}
      <div>
        <Label required>Tipo</Label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="RECLAMO" {...register('type')} defaultChecked />
            Reclamo <span className="text-ink-400">(disconformidad con el producto/servicio)</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="QUEJA" {...register('type')} />
            Queja <span className="text-ink-400">(malestar en la atención)</span>
          </label>
        </div>
      </div>

      {/* Datos del consumidor */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-ink-900">1. Identificación del consumidor</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName" required>Nombre completo</Label>
            <Input id="fullName" error={errors.fullName?.message} {...register('fullName')} />
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <div>
              <Label htmlFor="docType" required>Documento</Label>
              <Select id="docType" {...register('docType')}>
                <option value="DNI">DNI</option>
                <option value="CE">Carné de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="docNumber" required>Número</Label>
              <Input id="docNumber" error={errors.docNumber?.message} {...register('docNumber')} />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email" required>Correo</Label>
            <Input id="email" type="email" error={errors.email?.message} {...register('email')} />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" {...register('phone')} />
          </div>
        </div>
        <div>
          <Label htmlFor="address" required>Domicilio</Label>
          <Input id="address" error={errors.address?.message} {...register('address')} />
        </div>
      </fieldset>

      {/* Bien contratado */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-ink-900">2. Identificación del bien contratado</legend>
        <div>
          <Label htmlFor="itemDescription" required>Descripción del servicio</Label>
          <Input
            id="itemDescription"
            placeholder="Ej: Reserva de alojamiento en Barranco, Lima"
            error={errors.itemDescription?.message}
            {...register('itemDescription')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="amount">Monto reclamado (S/)</Label>
            <Input id="amount" type="number" step="0.01" {...register('amount')} />
          </div>
          <div>
            <Label htmlFor="reservationCode">Código de reserva (si aplica)</Label>
            <Input id="reservationCode" {...register('reservationCode')} />
          </div>
        </div>
      </fieldset>

      {/* Detalle */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-ink-900">3. Detalle</legend>
        <div>
          <Label htmlFor="detail" required>Detalle del reclamo o queja</Label>
          <Textarea id="detail" rows={4} error={errors.detail?.message} {...register('detail')} />
        </div>
        <div>
          <Label htmlFor="request" required>Pedido del consumidor</Label>
          <Textarea
            id="request"
            rows={2}
            placeholder="Ej: Solicito la devolución del monto pagado"
            error={errors.request?.message}
            {...register('request')}
          />
        </div>
      </fieldset>

      <p className="text-xs leading-relaxed text-ink-500">
        La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito
        previo para interponer una denuncia ante el INDECOPI.
      </p>

      <Button type="submit" size="lg" fullWidth loading={submit.isPending}>
        Enviar reclamo
      </Button>
    </form>
  );
}