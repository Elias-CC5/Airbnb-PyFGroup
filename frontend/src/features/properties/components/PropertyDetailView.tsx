'use client';

import { Avatar, Badge, Rating } from '@/components/ui';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import { BookingCard } from '@/features/reservations/components/BookingCard';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { BED_TYPE_LABEL, CANCELLATION_POLICY_DETAIL, CANCELLATION_POLICY_LABEL } from '@/constants';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PropertyCard as PropertyCardType, PropertyDetail } from '@/types';
import {
  ArrowUpDown,
  Bath,
  BedDouble,
  Building2,
  Check,
  Clock,
  Eye,
  Heart,
  MapPin,
  Moon,
  Ruler,
  Share2,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
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
    ...(property.areaM2 ? [{ icon: Ruler, label: `${property.areaM2} m²` }] : []),
    ...(property.floor != null ? [{ icon: Building2, label: `Piso ${property.floor}` }] : []),
    ...(property.bedType
      ? [{ icon: BedDouble, label: `Cama ${BED_TYPE_LABEL[property.bedType].toLowerCase()}` }]
      : []),
    ...(property.viewType ? [{ icon: Eye, label: property.viewType }] : []),
    ...(property.hasElevator ? [{ icon: ArrowUpDown, label: 'Con ascensor' }] : []),
  ];

  /** Reglas en formato "permitido / no permitido", con iconos de permitido y no permitido. */
  const rules = [
    { allowed: property.petsAllowed, label: 'mascotas' },
    { allowed: property.smokingAllowed, label: 'fumar' },
    { allowed: property.partiesAllowed, label: 'fiestas o eventos' },
    { allowed: property.suitableForChildren, label: 'niños' },
  ];

  const deposit = Number(property.securityDeposit);
  const extraGuest = Number(property.extraGuestFee);
  const hasExtraFees = deposit > 0 || extraGuest > 0;
  const hasDiscounts = property.weeklyDiscount > 0 || property.monthlyDiscount > 0;

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
      {/* minmax(0,1fr) evita que un texto largo sin espacios ensanche la columna
          izquierda y empuje la card de reserva fuera de la pantalla. */}
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_384px] lg:gap-16">
        <div className="min-w-0 space-y-10">
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
              <p
                key={i}
                className="mb-4 break-words text-[0.95rem] leading-relaxed text-ink-700 last:mb-0"
              >
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

          {/* Reglas de la casa */}
          <section className="border-b border-ink-200 pb-9">
            <h2 className="text-xl font-semibold text-ink-900">Reglas de la casa</h2>
            <ul className="mt-4 grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
              {rules.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2.5">
                  {rule.allowed ? (
                    <Check className="size-4 shrink-0 text-ink-900" aria-hidden />
                  ) : (
                    <X className="size-4 shrink-0 text-ink-400" aria-hidden />
                  )}
                  <span className={cn(!rule.allowed && 'text-ink-500')}>
                    {rule.allowed ? 'Se permiten' : 'No se permiten'} {rule.label}
                  </span>
                </li>
              ))}

              {property.quietHoursFrom && property.quietHoursTo && (
                <li className="flex items-center gap-2.5">
                  <Moon className="size-4 shrink-0 text-ink-900" aria-hidden />
                  <span>
                    Silencio de {property.quietHoursFrom} a {property.quietHoursTo}
                  </span>
                </li>
              )}
            </ul>

            {property.houseRules && (
              <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-ink-600">
                {property.houseRules}
              </p>
            )}
          </section>

          {/* Cancelación y cobros adicionales */}
          <section className="border-b border-ink-200 pb-9">
            <h2 className="text-xl font-semibold text-ink-900">Política de cancelación</h2>
            <div className="mt-4 flex items-start gap-2.5 text-sm text-ink-700">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-900" aria-hidden />
              <p>
                <span className="font-medium text-ink-900">
                  {CANCELLATION_POLICY_LABEL[property.cancellationPolicy]}.
                </span>{' '}
                {CANCELLATION_POLICY_DETAIL[property.cancellationPolicy]}
              </p>
            </div>

            {(hasExtraFees || hasDiscounts) && (
              <ul className="mt-4 space-y-2 text-sm text-ink-600">
                {deposit > 0 && <li>Depósito de garantía: {formatPrice(deposit)}</li>}
                {extraGuest > 0 && (
                  <li>Huésped adicional: {formatPrice(extraGuest)} por noche</li>
                )}
                {property.weeklyDiscount > 0 && (
                  <li>{property.weeklyDiscount}% de descuento en estadías de 7 noches o más</li>
                )}
                {property.monthlyDiscount > 0 && (
                  <li>{property.monthlyDiscount}% de descuento en estadías de 28 noches o más</li>
                )}
              </ul>
            )}
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