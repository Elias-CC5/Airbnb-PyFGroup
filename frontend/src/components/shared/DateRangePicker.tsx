'use client';

import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  /** Rangos ya ocupados que se muestran deshabilitados. */
  disabledRanges?: Array<{ from: Date; to: Date }>;
  numberOfMonths?: number;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  disabledRanges = [],
  numberOfMonths = 2,
  className,
}: DateRangePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <DayPicker
      mode="range"
      locale={es}
      selected={value}
      onSelect={onChange}
      numberOfMonths={numberOfMonths}
      disabled={[{ before: today }, ...disabledRanges]}
      className={cn('wasi-daypicker', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-8',
        month_caption: 'flex justify-center py-2 mb-2 text-sm font-semibold text-ink-900 capitalize',
        weekday: 'text-ink-400 text-xs font-medium',
        day_button:
          'size-9 rounded-full text-sm transition-colors hover:bg-ink-100 aria-selected:bg-ink-900 aria-selected:text-white',
        selected: 'text-white',
        range_middle: '[&>button]:bg-clay-50 [&>button]:text-ink-900 [&>button]:rounded-none',
        range_start: '[&>button]:bg-ink-900 [&>button]:text-white',
        range_end: '[&>button]:bg-ink-900 [&>button]:text-white',
        today: 'font-semibold text-clay-700',
        disabled: 'text-ink-300 line-through opacity-60',
        chevron: 'fill-ink-700',
      }}
    />
  );
}

export type { DateRange };
