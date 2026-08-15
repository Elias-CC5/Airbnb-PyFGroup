'use client';

import { Button, Card, CardContent, Spinner } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { adminService, type BookingChannel, type OccupancyNight } from '../services/admin.service';
import { OccupancyEntryDialog, type EntryDraft } from './OccupancyEntryDialog';

/** Colores de la leyenda, alineados con los del Excel exportado. */
const CHANNEL: Record<BookingChannel, { label: string; dot: string; cell: string }> = {
  AIRBNB: { label: 'Airbnb', dot: 'bg-[#92D050]', cell: 'bg-[#92D050]/25 border-[#92D050]' },
  BOOKING: { label: 'Booking', dot: 'bg-[#0070C0]', cell: 'bg-[#0070C0]/20 border-[#0070C0]' },
  EXPEDIA: { label: 'Expedia / VRBO', dot: 'bg-[#E5C100]', cell: 'bg-[#E5C100]/25 border-[#E5C100]' },
  TIKTOK: { label: 'TikTok y Pág.', dot: 'bg-[#C77DBE]', cell: 'bg-[#C77DBE]/25 border-[#C77DBE]' },
  DIRECT: { label: 'Directo (P&F)', dot: 'bg-[#00B7D4]', cell: 'bg-[#00B7D4]/20 border-[#00B7D4]' },
  OTHER: { label: 'Otros', dot: 'bg-ink-400', cell: 'bg-ink-200 border-ink-400' },
};

const WEEKDAY_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/** Suma o resta meses a una cadena YYYY-MM. */
function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1))
    .toLocaleDateString('es-PE', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function OccupancyCalendar() {
  const [month, setMonth] = useState(currentMonth);
  const [downloading, setDownloading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<EntryDraft | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'calendar', month],
    queryFn: () => adminService.calendar(month),
  });

  const importFile = useMutation({
    mutationFn: (file: File) => adminService.importCalendar(file),
    onSuccess: (summary) => {
      const months = summary.sheets.map((s) => s.month).join(', ');
      toast.success(
        `${summary.reservationsCreated} reservas nuevas y ${summary.reservationsUpdated} actualizadas` +
          (summary.propertiesCreated > 0
            ? `. Se crearon ${summary.propertiesCreated} alojamientos en borrador`
            : ''),
        { description: `Meses importados: ${months}`, duration: 8000 },
      );
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const move = useMutation({
    mutationFn: ({
      reservationId,
      propertyId,
      checkIn,
      checkOut,
    }: {
      reservationId: string;
      propertyId: string;
      checkIn: string;
      checkOut: string;
    }) => adminService.updateEntry(reservationId, { propertyId, checkIn, checkOut }),
    onSuccess: () => {
      toast.success('Estadía movida');
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const download = async () => {
    setDownloading(true);
    try {
      await adminService.downloadCalendar(month);
    } catch {
      toast.error('No se pudo generar el archivo');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Calendario de ocupación</h1>
          <p className="mt-1 text-sm text-ink-600">
            Una fila por alojamiento y una columna por día, con el huésped de cada noche.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-ink-200 p-1">
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              aria-label="Mes anterior"
              className="grid size-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="min-w-[9rem] text-center text-sm font-medium text-ink-900">
              {monthLabel(month)}
            </span>
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              aria-label="Mes siguiente"
              className="grid size-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) importFile.mutate(file);
            }}
          />

          <Button variant="outline" onClick={() => fileRef.current?.click()} loading={importFile.isPending}>
            <Upload className="size-4" /> Subir Excel
          </Button>

          <Button variant="outline" onClick={download} loading={downloading}>
            <Download className="size-4" /> Descargar
          </Button>
        </div>
      </header>

      {/* Leyenda */}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {Object.entries(CHANNEL).map(([key, channel]) => (
          <li key={key} className="inline-flex items-center gap-2 text-xs text-ink-600">
            <span className={cn('size-3 rounded-sm', channel.dot)} aria-hidden />
            {channel.label}
          </li>
        ))}
      </ul>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="grid place-items-center py-20">
              <Spinner />
            </div>
          ) : !data || data.rows.length === 0 ? (
            <p className="py-20 text-center text-sm text-ink-500">
              No hay alojamientos publicados todavía.
            </p>
          ) : (
            <CalendarGrid
              data={data}
              onPick={setDraft}
              onMove={(reservationId, propertyId, checkIn, checkOut) =>
                move.mutate({ reservationId, propertyId, checkIn, checkOut })
              }
            />
          )}
        </CardContent>
      </Card>

      <OccupancyEntryDialog draft={draft} onClose={() => setDraft(null)} />
    </div>
  );
}

interface GridProps {
  data: NonNullable<Awaited<ReturnType<typeof adminService.calendar>>>;
  onPick: (draft: EntryDraft) => void;
  onMove: (reservationId: string, propertyId: string, checkIn: string, checkOut: string) => void;
}

/** Suma días a una fecha YYYY-MM-DD sin salirse de UTC. */
function addDays(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function CalendarGrid({ data, onPick, onMove }: GridProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [dragging, setDragging] = useState<OccupancyNight | null>(null);

  /** Al soltar, la estadía conserva sus noches y empieza en el día destino. */
  const drop = (propertyId: string, day: string) => {
    if (!dragging) return;
    const offset = Math.round(
      (new Date(`${day}T00:00:00Z`).getTime() - new Date(`${dragging.date}T00:00:00Z`).getTime()) /
        86_400_000,
    );
    if (offset === 0 && propertyId === dragging.propertyId) return;

    onMove(
      dragging.reservationId,
      propertyId,
      addDays(dragging.checkIn, offset),
      addDays(dragging.checkOut, offset),
    );
    setDragging(null);
  };

  return (
    // overflow-x-auto: en un mes de 31 días la tabla no cabe en pantalla.
    <div className="overflow-x-auto">
      <table className="w-max border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-[220px] border-b border-r border-ink-200 bg-white p-3 text-left font-semibold text-ink-900">
              Alojamiento
            </th>
            {data.days.map((day) => {
              const date = new Date(`${day}T00:00:00Z`);
              const weekday = date.getUTCDay();
              const isWeekend = weekday === 0 || weekday === 6;

              return (
                <th
                  key={day}
                  className={cn(
                    'w-[92px] border-b border-r border-ink-200 p-2 text-center font-medium',
                    isWeekend ? 'bg-ink-100 text-ink-700' : 'bg-ink-50 text-ink-600',
                    day === today && 'bg-ink-900 text-white',
                  )}
                >
                  <span className="block text-[10px] uppercase opacity-70">
                    {WEEKDAY_SHORT[weekday]}
                  </span>
                  {Number(day.slice(8, 10))}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.rows.map((row) => (
            <tr key={row.propertyId}>
              <th
                scope="row"
                className="sticky left-0 z-10 min-w-[220px] border-b border-r border-ink-200 bg-white p-3 text-left font-medium text-ink-900"
              >
                <Link href={`/admin/alojamientos/${row.propertyId}`} className="hover:underline">
                  {row.title}
                </Link>
              </th>

              {data.days.map((day) => {
                const night = row.nights.find((n) => n.date === day);
                return (
                  <NightCell
                    key={day}
                    night={night}
                    onDragStart={() => setDragging(night ?? null)}
                    onDragEnd={() => setDragging(null)}
                    onDrop={() => drop(row.propertyId, day)}
                    onClick={() =>
                      onPick(
                        night
                          ? {
                              reservationId: night.reservationId,
                              propertyId: row.propertyId,
                              propertyTitle: row.title,
                              guestName: night.guest,
                              checkIn: night.checkIn,
                              checkOut: night.checkOut,
                              pricePerNight: night.pricePerNight,
                              channel: night.channel,
                              status: night.status,
                            }
                          : {
                              propertyId: row.propertyId,
                              propertyTitle: row.title,
                              guestName: '',
                              checkIn: day,
                              checkOut: addDays(day, 1),
                              pricePerNight: 0,
                              channel: 'DIRECT',
                              status: 'CONFIRMED',
                            },
                      )
                    }
                  />
                );
              })}
            </tr>
          ))}

          <tr>
            <th
              scope="row"
              className="sticky left-0 z-10 border-r border-t-2 border-ink-300 bg-white p-3 text-left font-semibold text-ink-900"
            >
              Ingreso del día
            </th>
            {data.days.map((day) => (
              <td
                key={day}
                className="border-r border-t-2 border-ink-300 p-2 text-center font-semibold text-ink-700"
              >
                {data.totals[day] > 0 ? formatPrice(data.totals[day], false) : '—'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface NightCellProps {
  night?: OccupancyNight;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}

function NightCell({ night, onClick, onDragStart, onDragEnd, onDrop }: NightCellProps) {
  // preventDefault en dragOver es lo que habilita el drop en HTML nativo.
  const dropProps = {
    onDragOver: (event: React.DragEvent) => event.preventDefault(),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      onDrop();
    },
  };

  if (!night) {
    return (
      <td className="border-b border-r border-ink-200 p-1" {...dropProps}>
        <button
          type="button"
          onClick={onClick}
          aria-label="Registrar estadía"
          className="h-11 w-full rounded-md text-ink-300 transition hover:bg-ink-100 hover:text-ink-600"
        >
          +
        </button>
      </td>
    );
  }

  const channel = CHANNEL[night.channel] ?? CHANNEL.OTHER;

  return (
    <td className="border-b border-r border-ink-200 p-1 align-top" {...dropProps}>
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === 'Enter' && onClick()}
        title={`${night.guest} · ${night.code} · ${night.nights} noche(s) · ${channel.label}`}
        className={cn(
          'cursor-grab rounded-md border-l-[3px] px-2 py-1.5 leading-tight transition hover:brightness-95 active:cursor-grabbing',
          channel.cell,
          night.status === 'PENDING' && 'opacity-60',
        )}
      >
        <span className="block truncate font-medium text-ink-900">{night.guest}</span>
        <span className="block text-[10px] text-ink-600">{formatPrice(night.pricePerNight)}</span>
      </div>
    </td>
  );
}
