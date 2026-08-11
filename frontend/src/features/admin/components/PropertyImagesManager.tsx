'use client';

import { Button, ConfirmDialog } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PropertyImage } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadsService } from '../services/uploads.service';

const MAX_MB = 5;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Subida múltiple con preview, imagen principal, reordenamiento y borrado. */
export function PropertyImagesManager({
  propertyId,
  images,
}: {
  propertyId: string;
  images: PropertyImage[];
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [list, setList] = useState(images);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['properties'] });

  const upload = useMutation({
    mutationFn: (files: File[]) => uploadsService.uploadPropertyImages(propertyId, files),
    onSuccess: (created) => {
      setList((prev) => [...prev, ...created]);
      toast.success(`${created.length} imagen(es) subidas`);
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setMain = useMutation({
    mutationFn: (imageId: string) => uploadsService.setMain(imageId),
    onSuccess: (_, imageId) => {
      setList((prev) => prev.map((image) => ({ ...image, isMain: image.id === imageId })));
      toast.success('Imagen principal actualizada');
      void refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (imageId: string) => uploadsService.remove(imageId),
    onSuccess: (_, imageId) => {
      setList((prev) => prev.filter((image) => image.id !== imageId));
      setToDelete(null);
      toast.success('Imagen eliminada');
      void refresh();
    },
  });

  const reorder = useMutation({
    mutationFn: (ids: string[]) => uploadsService.reorder(propertyId, ids),
    onError: (error: Error) => toast.error(error.message),
  });

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);

    const invalid = files.find((f) => !ACCEPTED.includes(f.type) || f.size > MAX_MB * 1024 * 1024);
    if (invalid) {
      toast.error(`"${invalid.name}" no es válida. Usa JPG, PNG o WebP de máximo ${MAX_MB} MB.`);
      return;
    }

    upload.mutate(files);
  };

  const move = (index: number, delta: number) => {
    const next = [...list];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setList(next);
    reorder.mutate(next.map((image) => image.id));
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 px-4 py-8 text-center transition hover:border-clay-500 hover:bg-clay-50/50"
      >
        <ImagePlus className="size-6 text-ink-400" />
        <span className="text-sm font-medium text-ink-900">Subir imágenes</span>
        <span className="text-xs text-ink-500">JPG, PNG o WebP · máx. {MAX_MB} MB c/u</span>
      </button>

      {upload.isPending && <p className="text-sm text-ink-500">Subiendo imágenes…</p>}

      {list.length > 0 && (
        <ul className="space-y-2">
          {list.map((image, index) => (
            <li
              key={image.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-2',
                image.isMain ? 'border-clay-500 bg-clay-50/60' : 'border-ink-200',
              )}
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <Image src={image.url} alt={image.alt ?? ''} fill sizes="56px" className="object-cover" />
              </span>

              <span className="min-w-0 flex-1 text-xs text-ink-500">
                {image.isMain ? <span className="font-medium text-clay-700">Principal</span> : `Foto ${index + 1}`}
              </span>

              <span className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Mover arriba"
                  className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                >
                  <ArrowLeft className="size-3.5 rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === list.length - 1}
                  aria-label="Mover abajo"
                  className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                >
                  <ArrowRight className="size-3.5 rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => setMain.mutate(image.id)}
                  disabled={image.isMain}
                  aria-label="Marcar como principal"
                  className="grid size-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 disabled:opacity-30"
                >
                  <Star className={cn('size-3.5', image.isMain && 'fill-clay-500 text-clay-500')} />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(image.id)}
                  aria-label="Eliminar imagen"
                  className="grid size-8 place-items-center rounded-lg text-danger-700 hover:bg-danger-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar imagen?"
        description="La imagen se borrará del alojamiento y del almacenamiento."
        confirmLabel="Eliminar"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete)}
      />
    </div>
  );
}
