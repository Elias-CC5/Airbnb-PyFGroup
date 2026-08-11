'use client';

import { Modal } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PropertyImage } from '@/types';
import { ChevronLeft, ChevronRight, Grid2X2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

/**
 * Mosaico 1 + 4 en desktop, carrusel deslizable en móvil,
 * y visor a pantalla completa con navegación por teclado.
 */
export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  if (!images.length) {
    return <div className="grid aspect-[16/9] w-full place-items-center rounded-3xl bg-ink-100 text-ink-400">Sin fotos</div>;
  }

  const [main, ...rest] = images;
  const go = (delta: number) => setCurrent((c) => (c + delta + images.length) % images.length);

  return (
    <>
      {/* Móvil: carrusel con scroll-snap */}
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 md:hidden">
        {images.map((image, i) => (
          <button
            key={image.id}
            onClick={() => {
              setCurrent(i);
              setOpen(true);
            }}
            className="relative aspect-[4/3] w-[85vw] shrink-0 snap-center overflow-hidden rounded-2xl bg-ink-100"
          >
            <Image src={image.url} alt={image.alt ?? title} fill sizes="85vw" className="object-cover" priority={i === 0} />
          </button>
        ))}
      </div>

      {/* Desktop: mosaico */}
      <div className="relative hidden grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid md:h-[460px]">
        <button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
          className="relative col-span-2 row-span-2 overflow-hidden bg-ink-100"
        >
          <Image
            src={main.url}
            alt={main.alt ?? title}
            fill
            sizes="50vw"
            priority
            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        </button>

        {rest.slice(0, 4).map((image, i) => (
          <button
            key={image.id}
            onClick={() => {
              setCurrent(i + 1);
              setOpen(true);
            }}
            className="relative overflow-hidden bg-ink-100"
          >
            <Image
              src={image.url}
              alt={image.alt ?? title}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          </button>
        ))}

        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 shadow-sm transition hover:bg-ink-50"
        >
          <Grid2X2 className="size-4" />
          Ver las {images.length} fotos
        </button>
      </div>

      {/* Visor */}
      <Modal open={open} onClose={() => setOpen(false)} size="lg" title={`${title} — foto ${current + 1} de ${images.length}`}>
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-ink-100">
          <Image src={images[current].url} alt={images[current].alt ?? title} fill sizes="90vw" className="object-contain" />

          <button
            onClick={() => go(-1)}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-sm transition hover:bg-white"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-sm transition hover:bg-white"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setCurrent(i)}
              className={cn(
                'relative size-16 shrink-0 overflow-hidden rounded-lg transition',
                i === current ? 'ring-2 ring-clay-600 ring-offset-2' : 'opacity-70 hover:opacity-100',
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
