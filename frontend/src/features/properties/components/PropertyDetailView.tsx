'use client';

import { Avatar, Badge, Rating } from '@/components/ui';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import { BookingCard } from '@/features/reservations/components/BookingCard';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PropertyCard as PropertyCardType, PropertyDetail } from '@/types';
import { Bath, BedDouble, Clock, Heart, MapPin, Share2, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { PropertyAmenities } from './PropertyAmenities';
import { PropertyGallery } from './PropertyGallery';
import { PropertyGrid } from './PropertyGrid';
import { PropertyMap } from './PropertyMap';

interface Props {
  property: PropertyDetail;
  similar: PropertyCardType[];
  place: string;
}

export function PropertyDetailView({ property, similar, place }: Props) {
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();
  const isFavorite = favoriteIds?.includes(property.id) ?? property.isFavorite ?? false;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property.title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success('Enlace copiado');
  };

  const facts = [
    { icon: Users, label: `${property.maxGuests} huéspedes` },
    { icon: BedDouble, label: `${property.bedrooms} habitaciones · ${property.beds} camas` },
    { icon: Bath, label: `${property.bathrooms} baños` },
    { icon: Clock, label: `Check-in ${property.checkInTime} · Check-out ${property.checkOutTime}` },
  ];

  return (
    // pt-28: deja hueco a la barra de navegación flotante.
    <div className="container-page pb-8 pt-28">
      {/* Encabezado */}
      <nav aria-label="Ruta de navegación" className="mb-4 text-sm text-ink-500">
        <Link href="/alojamientos" className="hover:text-ink-900 hover:underline">
          Alojamientos
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          href={`/alojamientos?department=${property.location.department.slug}`}
          className="hover:text-ink-900 hover:underline"
        >
          {property.location.department.name}
        </Link>
      </nav>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-[2rem]">
            {property.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600">
            <Rating value={property.ratingAvg} count={property.reviewsCount} />
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {place}
            </span>
            <Badge tone="clay">{property.category.name}</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-800 transition hover:bg-ink-100"
          >
            <Share2 className="size-4" /> Compartir
          </button>
          <button
            onClick={() => toggleFavorite.mutate(property.id)}
            aria-pressed={isFavorite}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-800 transition hover:bg-ink-100"
          >
            <Heart className={cn('size-4', isFavorite && 'fill-clay-600 text-clay-600')} />
            {isFavorite ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <PropertyGallery images={property.images} title={property.title} />

      {/* Contenido + card de reserva */}
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_384px] lg:gap-16">
        <div className="space-y-10">
          <section>
            <div className="flex items-start justify-between gap-6 border-b border-ink-200 pb-7">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">
                  {property.category.name} en {place}
                </h2>
                <ul className="mt-3 grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
                  {facts.map((fact) => (
                    <li key={fact.label} className="inline-flex items-center gap-2">
                      <fact.icon className="size-4 text-ink-400" /> {fact.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <Avatar
                  src={property.owner.avatarUrl}
                  firstName={property.owner.firstName}
                  lastName={property.owner.lastName}
                  size="lg"
                  className="mx-auto"
                />
                <p className="mt-2 text-sm font-medium text-ink-900">
                  {property.owner.firstName} {property.owner.lastName.charAt(0)}.
                </p>
                <p className="text-xs text-ink-500">Anfitrión</p>
              </div>
            </div>
          </section>

          <section className="border-b border-ink-200 pb-9">
            <h2 className="sr-only">Descripción</h2>
            {property.description.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-4 text-[0.95rem] leading-relaxed text-ink-700 last:mb-0">
                {paragraph}
              </p>
            ))}
          </section>

          <div className="border-b border-ink-200 pb-9">
            <PropertyAmenities amenities={property.amenities.map((a) => a.amenity)} />
          </div>

          <section className="border-b border-ink-200 pb-9">
            <PropertyMap
              location={property.location}
              place={place}
              reference={property.location.reference}
            />
          </section>

          <ReviewsSection propertyId={property.id} />
        </div>

        {/* Card de reserva (sticky en desktop) */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <BookingCard property={property} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20 border-t border-ink-200 pt-12">
          <h2 className="mb-7 text-2xl font-semibold tracking-tight text-ink-900">
            Alojamientos similares
          </h2>
          <PropertyGrid properties={similar} />
        </section>
      )}

      {/* Barra fija de reserva en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-ink-200 bg-white px-5 py-3 lg:hidden">
        <div>
          <p className="text-base font-semibold text-ink-900">
            {formatPrice(property.pricePerNight)}{' '}
            <span className="text-sm font-normal text-ink-500">noche</span>
          </p>
          <Rating value={property.ratingAvg} count={property.reviewsCount} />
        </div>

        <Link
          href="#contenido"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="rounded-xl bg-clay-600 px-6 py-3 text-sm font-medium text-white"
        >
          Reservar
        </Link>
      </div>
    </div>
  );
}