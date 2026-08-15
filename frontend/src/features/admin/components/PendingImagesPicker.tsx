'use client';

import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export const MAX_MB = 5;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Imagen elegida en el navegador que todavía no existe en el servidor. */
export interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  isMain: boolean;
}

interface PendingImagesPickerProps {
  value: PendingImage[];
  onChange: (next: PendingImage[]) => void;
  disabled?: boolean;
}

/**
 * Selector de imágenes para el formulario de creación: guarda los File en
 * memoria y muestra previews locales. La subida real ocurre después de crear
 * el alojamiento, cuando ya existe un ID al que asociarlas.
 */
export function PendingImagesPicker({ value, onChange, disabled }: PendingImagesPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Libera los object URLs al desmontar para no filtrar memoria.
  useEffect(() => {
    return () => {
      value.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);

    const invalid = files.find(
      (file) => !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_MB * 1024 * 1024,
    );
    if (invalid) {
      toast.error(`"${invalid.name}" no es válida. Usa JPG, PNG o WebP de máximo ${MAX_MB} MB.`);
      return;
    }

    const added: PendingImage[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isMain: false,
    }));

    const next = [...value, ...added];
    if (!next.some((image) => image.isMain)) next[0].isMain = true;
    onChange(next);
  };

  const remove = (id: string) => {
    const target = value.find((image) => image.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);

    const next = value.filter((image) => image.id !== id);
    if (next.length > 0 && !next.some((image) => image.isMain)) next[0].isMain = true;
    onChange(next);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const setMain = (id: string) => {
    onChange(value.map((image) => ({ ...image, isMain: image.id === id })));
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 px-4 py-8 text-center transition hover:border-clay-500 hover:bg-clay-50/50 disabled:opacity-50"
      >
        <ImagePlus className="size-6 text-ink-400" />
        <span className="text-sm font-medium text-ink-900">Adjuntar imágenes</span>
        <span className="text-xs text-ink-500">JPG, PNG o WebP · máx. {MAX_MB} MB c/u</span>
      </button>

      {value.length > 0 && (
        <>
          <ul className="space-y-2">
            {value.map((image, index) => (
              <li
                key={image.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-2',
                  image.isMain ? 'border-clay-500 bg-clay-50/60' : 'border-ink-200',
                )}
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.previewUrl}
                    alt={image.file.name}
                    className="size-full object-cover"
                  />
                </span>

                <span className="min-w-0 flex-1 text-xs text-ink-500">
                  {image.isMain ? (
                    <span className="font-medium text-clay-700">Principal</span>
                  ) : (
                    `Foto ${index + 1}`
                  )}
                  <span className="block truncate text-ink-400">{image.file.name}</span>
                </span>

                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || disabled}
                    aria-label="Mover arriba"
                    className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  >
                    <ArrowLeft className="size-3.5 rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1 || disabled}
                    aria-label="Mover abajo"
                    className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  >
                    <ArrowRight className="size-3.5 rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMain(image.id)}
                    disabled={image.isMain || disabled}
                    aria-label="Marcar como principal"
                    className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                  >
                    <Star className={cn('size-3.5', image.isMain && 'fill-clay-500 text-clay-500')} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(image.id)}
                    disabled={disabled}
                    aria-label="Quitar imagen"
                    className="grid size-8 place-items-center rounded-lg text-danger-700 hover:bg-danger-50 disabled:opacity-30"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>

          <p className="text-xs leading-relaxed text-ink-500">
            {value.length} imagen(es) listas. Se subirán al guardar el alojamiento.
          </p>
        </>
      )}
    </div>
  );
}
