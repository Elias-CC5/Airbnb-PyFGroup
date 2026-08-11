'use client';

import { Rating } from '@/components/ui';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PropertyCard as PropertyCardType } from '@/types';
import { Heart, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface PropertyCardProps {
  property: PropertyCardType;
  priority?: boolean;
  className?: string;
}

export function PropertyCard({ property, priority, className }: PropertyCardProps) {
  const [index, setIndex] = useState(0);
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const images = property.images.length ? property.images : [{ id: 'ph', url: '', alt: property.title, isMain: true, order: 0 }];
  const isFavorite = favoriteIds?.includes(property.id) ?? property.isFavorite ?? false;
  const place = [property.location.district?.name, property.location.department.name]
    .filter(Boolean)
    .join(', ');

  return (
    <article className={cn('group relative', className)}>
      {/* --- Galería en miniatura --- */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
        {images[index]?.url ? (
          <Image
            src={images[index].url}
            alt={images[index].alt ?? property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-ink-400">Sin imagen</div>
        )}

        <button
          type="button"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite.mutate(property.id);
          }}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/85 backdrop-blur-sm transition hover:scale-110 hover:bg-white"
        >
          <Heart
            className={cn(
              'size-4.5 transition-colors',
              isFavorite ? 'fill-clay-600 text-clay-600' : 'text-ink-700',
            )}
          />
        </button>

        {property.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-900 backdrop-blur-sm">
            Destacado
          </span>
        )}

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {images.slice(0, 5).map((image, i) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Ver foto ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  setIndex(i);
                }}
                className={cn(
                  'size-1.5 rounded-full transition-all',
                  i === index ? 'w-4 bg-white' : 'bg-white/60 hover:bg-white',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Información --- */}
      <Link href={`/alojamiento/${property.slug}`} className="mt-3 block">
        <span className="absolute inset-0" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-[0.95rem] font-semibold text-ink-900">{property.title}</h3>
          <Rating value={property.ratingAvg} showValue className="shrink-0" />
        </div>

        <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">{place}</p>

        <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-500">
          <Users className="size-3.5" />
          {property.maxGuests} huéspedes · {property.bedrooms} hab. · {property.bathrooms} baños
        </p>

        <p className="mt-2 text-[0.95rem] text-ink-900">
          <span className="font-semibold">{formatPrice(property.pricePerNight)}</span>
          <span className="text-ink-500"> noche</span>
        </p>
      </Link>
    </article>
  );
}
