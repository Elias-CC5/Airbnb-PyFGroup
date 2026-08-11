'use client';

import { Button, Input, Label, Modal, Select } from '@/components/ui';
import { useAmenitiesGrouped, useCategories } from '@/features/properties/hooks/useCatalog';
import { cn } from '@/lib/utils';
import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchFilters } from '../hooks/useSearchFilters';

const COUNTS = [1, 2, 3, 4, 5];

export function FiltersPanel() {
  const { filters, setFilters, clearFilters, activeCount } = useSearchFilters();
  const { data: categories } = useCategories();
  const { data: amenityGroups } = useAmenitiesGrouped();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const toggleAmenity = (id: number) =>
    setDraft((d) => {
      const current = d.amenities ?? [];
      return { ...d, amenities: current.includes(id) ? current.filter((a) => a !== id) : [...current, id] };
    });

  const apply = () => {
    setFilters({
      category: draft.category,
      minPrice: draft.minPrice,
      maxPrice: draft.maxPrice,
      guests: draft.guests,
      bedrooms: draft.bedrooms,
      bathrooms: draft.bathrooms,
      amenities: draft.amenities,
    });
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="shrink-0">
        <SlidersHorizontal className="size-4" />
        Filtros
        {activeCount > 0 && (
          <span className="ml-1 grid size-5 place-items-center rounded-full bg-ink-900 text-[11px] font-semibold text-white">
            {activeCount}
          </span>
        )}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Filtros"
        description="Ajusta la búsqueda a lo que necesitas"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                clearFilters();
                setOpen(false);
              }}
            >
              Limpiar todo
            </Button>
            <Button onClick={apply}>Mostrar resultados</Button>
          </>
        }
      >
        <div className="space-y-7">
          {/* Tipo de alojamiento */}
          <section>
            <Label>Tipo de alojamiento</Label>
            <Select
              value={draft.category ?? ''}
              onChange={(e) => setDraft({ ...draft, category: e.target.value || undefined })}
            >
              <option value="">Todos los tipos</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </section>

          {/* Precio */}
          <section>
            <Label>Rango de precio por noche (S/)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                placeholder="Mínimo"
                value={draft.minPrice ?? ''}
                onChange={(e) => setDraft({ ...draft, minPrice: e.target.value ? Number(e.target.value) : undefined })}
              />
              <span className="text-ink-400">—</span>
              <Input
                type="number"
                min={0}
                placeholder="Máximo"
                value={draft.maxPrice ?? ''}
                onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </section>

          {/* Capacidad */}
          {(
            [
              ['guests', 'Huéspedes'],
              ['bedrooms', 'Habitaciones'],
              ['bathrooms', 'Baños'],
            ] as const
          ).map(([key, label]) => (
            <section key={key}>
              <Label>{label}</Label>
              <div className="flex flex-wrap gap-2">
                <ChipButton active={!draft[key]} onClick={() => setDraft({ ...draft, [key]: undefined })}>
                  Cualquiera
                </ChipButton>
                {COUNTS.map((n) => (
                  <ChipButton key={n} active={draft[key] === n} onClick={() => setDraft({ ...draft, [key]: n })}>
                    {n}
                    {n === 5 ? '+' : ''}
                  </ChipButton>
                ))}
              </div>
            </section>
          ))}

          {/* Amenidades */}
          <section>
            <Label>Comodidades</Label>
            <div className="space-y-4">
              {amenityGroups?.map((group) => (
                <div key={group.group}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{group.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((amenity) => (
                      <ChipButton
                        key={amenity.id}
                        active={draft.amenities?.includes(amenity.id) ?? false}
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        {amenity.name}
                      </ChipButton>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}

function ChipButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3.5 py-2 text-sm transition',
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-ink-300 text-ink-700 hover:border-ink-500 hover:bg-ink-50',
      )}
    >
      {children}
    </button>
  );
}
