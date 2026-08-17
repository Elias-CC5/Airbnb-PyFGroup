'use client';

import { DateRangePicker, type DateRange } from '@/components/shared/DateRangePicker';
import { Badge, Button, Modal, Rating, Textarea } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { WhatsappButton } from '@/features/whatsapp/components/WhatsappButton';
import { buildReservationWhatsappUrl } from '@/features/whatsapp/services/whatsapp.service';
import { formatDate, formatPrice, toISODate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AvailabilityResult, PropertyDetail } from '@/types';
import { CalendarDays, Minus, Plus, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCheckAvailability, useOccupiedDates } from '../hooks/useAvailability';
import { useCreateReservation } from '../hooks/useReservations';

/**
 * Card lateral de reserva: fechas → verificación de disponibilidad en el backend
 * → desglose de precio → confirmación. Nunca calcula el total sólo en el cliente.
 */
export function BookingCard({ property }: { property: PropertyDetail }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quote, setQuote] = useState<AvailabilityResult | null>(null);

  const { data: occupied } = useOccupiedDates(property.id);
  const checkAvailability = useCheckAvailability(property.id);
  const createReservation = useCreateReservation();

  const disabledRanges =
    occupied?.map((r) => ({ from: new Date(r.from), to: new Date(new Date(r.to).getTime() - 86_400_000) })) ?? [];

  // Cada vez que hay un rango completo consultamos precio y disponibilidad reales.
  useEffect(() => {
    if (!range?.from || !range?.to) {
      setQuote(null);
      return;
    }
    checkAvailability.mutate(
      { checkIn: toISODate(range.from), checkOut: toISODate(range.to), guests },
      { onSuccess: setQuote, onError: () => setQuote(null) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range?.from, range?.to, guests]);

  const location = `${property.location.district?.name ?? property.location.province.name}, ${property.location.department.name}`;

  const handleReserve = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/alojamiento/${property.slug}`);
      return;
    }
    setConfirmOpen(true);
  };

  const confirmReservation = async () => {
    if (!range?.from || !range?.to) return;

    // La pestaña se abre ANTES del await: si se abriera después, el navegador
    // la bloquearía por no venir directamente de un clic del usuario.
    const waTab = window.open('', '_blank');

    const reservation = await createReservation
      .mutateAsync({
        propertyId: property.id,
        checkIn: toISODate(range.from),
        checkOut: toISODate(range.to),
        guests,
        notes: notes || undefined,
      })
      .catch(() => null);

    if (!reservation) {
      waTab?.close();
      return;
    }

    const whatsappUrl = buildReservationWhatsappUrl({
      phone: property.whatsappPhone,
      code: reservation.code,
      propertyTitle: property.title,
      location,
      checkIn: formatDate(range.from),
      checkOut: formatDate(range.to),
      guests,
      total: quote ? formatPrice(quote.total) : undefined,
      notes: notes || undefined,
    });

    if (waTab) waTab.location.href = whatsappUrl;
    else window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setConfirmOpen(false);
    router.push('/mis-reservas');
  };

  return (
    <>
      <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-md">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-2xl font-semibold text-ink-900">
            {formatPrice(property.pricePerNight)}
            <span className="text-base font-normal text-ink-500"> noche</span>
          </p>
          <Rating value={property.ratingAvg} count={property.reviewsCount} />
        </div>

        {/* Selector de fechas */}
        <button
          onClick={() => setCalendarOpen(true)}
          className="mt-5 grid w-full grid-cols-2 overflow-hidden rounded-2xl border border-ink-300 text-left transition hover:border-ink-500"
        >
          <span className="border-r border-ink-200 px-4 py-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Entrada</span>
            <span className={cn('text-sm', range?.from ? 'text-ink-900' : 'text-ink-400')}>
              {range?.from ? formatDate(range.from) : 'Agregar fecha'}
            </span>
          </span>
          <span className="px-4 py-3">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Salida</span>
            <span className={cn('text-sm', range?.to ? 'text-ink-900' : 'text-ink-400')}>
              {range?.to ? formatDate(range.to) : 'Agregar fecha'}
            </span>
          </span>
        </button>

        {/* Huéspedes */}
        <div className="mt-2.5 flex items-center justify-between rounded-2xl border border-ink-300 px-4 py-3">
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Huéspedes</span>
            <span className="text-sm text-ink-900">
              {guests} de {property.maxGuests} máx.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              disabled={guests <= 1}
              aria-label="Quitar huésped"
              className="grid size-8 place-items-center rounded-full border border-ink-300 transition hover:border-ink-500 disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-4 text-center text-sm font-medium">{guests}</span>
            <button
              onClick={() => setGuests((g) => Math.min(property.maxGuests, g + 1))}
              disabled={guests >= property.maxGuests}
              aria-label="Añadir huésped"
              className="grid size-8 place-items-center rounded-full border border-ink-300 transition hover:border-ink-500 disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Estado de la consulta */}
        {checkAvailability.isPending && (
          <p className="mt-4 text-sm text-ink-500">Verificando disponibilidad…</p>
        )}

        {quote && !quote.available && (
          <div className="mt-4 rounded-xl border border-danger-500/25 bg-danger-50 p-3.5 text-sm text-danger-700">
            {quote.reason ?? 'No disponible para esas fechas'}
          </div>
        )}

        {quote?.available && (
          <div className="mt-5 space-y-2.5 border-t border-ink-200 pt-5 text-sm">
            <div className="flex justify-between text-ink-700">
              <span className="underline underline-offset-2">
                {formatPrice(quote.pricePerNight)} × {quote.nights} noches
              </span>
              <span>{formatPrice(quote.subtotal)}</span>
            </div>
            {quote.cleaningFee > 0 && (
              <div className="flex justify-between text-ink-700">
                <span className="underline underline-offset-2">Tarifa de limpieza</span>
                <span>{formatPrice(quote.cleaningFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-200 pt-3 text-base font-semibold text-ink-900">
              <span>Total</span>
              <span>{formatPrice(quote.total)}</span>
            </div>
          </div>
        )}

        <Button
          size="lg"
          fullWidth
          className="mt-5"
          disabled={!quote?.available}
          onClick={handleReserve}
        >
          {quote?.available ? 'Reservar' : 'Selecciona tus fechas'}
        </Button>

        <p className="mt-3 text-center text-xs text-ink-500">Todavía no se te cobrará nada</p>

        <div className="mt-4">
          <WhatsappButton
            phone={property.whatsappPhone}
            propertyTitle={property.title}
            location={location}
            checkIn={range?.from ? formatDate(range.from) : undefined}
            checkOut={range?.to ? formatDate(range.to) : undefined}
            guests={guests}
          />
        </div>

        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-ink-500">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success-700" />
          Coordinación directa con el anfitrión y cancelación gratuita antes del check-in.
        </p>
      </div>

      {/* Calendario */}
      <Modal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        title="Selecciona tus fechas"
        description={`Estadía mínima de ${property.minNights} noche(s)`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRange(undefined)}>
              Borrar fechas
            </Button>
            <Button onClick={() => setCalendarOpen(false)}>Listo</Button>
          </>
        }
      >
        <div className="flex justify-center">
          <DateRangePicker value={range} onChange={setRange} disabledRanges={disabledRanges} />
        </div>
      </Modal>

      {/* Confirmación */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirma tu reserva"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Volver
            </Button>
            <Button onClick={confirmReservation} loading={createReservation.isPending}>
              Confirmar reserva
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl bg-ink-50 p-4">
            <CalendarDays className="mt-0.5 size-5 text-ink-500" />
            <div className="text-sm">
              <p className="font-medium text-ink-900">{property.title}</p>
              <p className="text-ink-600">
                {range?.from && formatDate(range.from)} — {range?.to && formatDate(range.to)} · {guests} huéspedes
              </p>
              <p className="mt-1 font-semibold text-ink-900">Total: {quote && formatPrice(quote.total)}</p>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink-800">
              Mensaje para el anfitrión (opcional)
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cuéntale a qué hora llegarás o si vienes con niños…"
              maxLength={500}
            />
          </div>

          <Badge tone="warning">Tu reserva quedará pendiente hasta que el anfitrión la confirme</Badge>
        </div>
      </Modal>
    </>
  );
}
