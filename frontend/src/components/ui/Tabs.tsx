'use client';

import { cn } from '@/lib/utils';

interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  items: Array<{ value: T; label: string; count?: number }>;
  className?: string;
}

export function Tabs<T extends string>({ value, onChange, items, className }: TabsProps<T>) {
  return (
    <div className={cn('no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-ink-100 p-1', className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
            value === item.value ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-600 hover:text-ink-900',
          )}
        >
          {item.label}
          {item.count !== undefined && <span className="ml-1.5 text-ink-400">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
