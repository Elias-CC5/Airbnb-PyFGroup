'use client';

import { Button, Modal } from '@/components/ui';
import type { Amenity } from '@/types';
import * as Icons from 'lucide-react';
import { Check } from 'lucide-react';
import { useState } from 'react';

/** Resuelve el icono de lucide por nombre (kebab-case) con fallback a un check. */
function AmenityIcon({ name }: { name?: string | null }) {
  const pascal = (name ?? '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pascal];
  return Icon ? <Icon className="size-5 text-ink-700" /> : <Check className="size-5 text-ink-700" />;
}

export function PropertyAmenities({ amenities }: { amenities: Amenity[] }) {
  const [open, setOpen] = useState(false);
  const visible = amenities.slice(0, 8);

  const groups = amenities.reduce<Record<string, Amenity[]>>((acc, amenity) => {
    const key = amenity.group ?? 'Otros';
    (acc[key] ??= []).push(amenity);
    return acc;
  }, {});

  return (
    <section aria-labelledby="amenidades">
      <h2 id="amenidades" className="text-xl font-semibold text-ink-900">
        ¿Qué ofrece este lugar?
      </h2>

      <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {visible.map((amenity) => (
          <li key={amenity.id} className="flex items-center gap-3 text-ink-800">
            <AmenityIcon name={amenity.icon} />
            <span className="text-sm">{amenity.name}</span>
          </li>
        ))}
      </ul>

      {amenities.length > visible.length && (
        <Button variant="outline" className="mt-6" onClick={() => setOpen(true)}>
          Mostrar las {amenities.length} comodidades
        </Button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Lo que ofrece este alojamiento">
        <div className="space-y-7">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">{group}</h3>
              <ul className="space-y-3">
                {items.map((amenity) => (
                  <li key={amenity.id} className="flex items-center gap-3 border-b border-ink-100 pb-3 text-ink-800">
                    <AmenityIcon name={amenity.icon} />
                    <span className="text-sm">{amenity.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>
    </section>
  );
}
