'use client';

import { Avatar, Badge, Rating } from '@/components/ui';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import { BookingCard } from '@/features/reservations/components/BookingCard';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { BED_TYPE_LABEL, CANCELLATION_POLICY_DETAIL, CANCELLATION_POLICY_LABEL } from '@/constants';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PropertyCard as PropertyCardType, PropertyDetail } from '@/types';
import { Check, Heart, MapPin, Moon, Share2, ShieldCheck, X } from 'lucide-react';
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

/** Separador consistente entre bloques de contenido. */
const BLOCK = 'border-t border-ink-200 pt-8';
const HEADING = 'text-lg font-semibold text-ink-900';

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

  /** Datos duros en pares etiqueta/valor: escaneable de un vistazo. */
  const specs: Array<{ label: string; value: string }> = [
    { label: 'Huéspedes', value: String(property.maxGuests) },
    { label: 'Habitaciones', value: String(property.bedrooms) },
    { label: 'Camas', value: String(property.beds) },
    { label: 'Baños', value: String(property.bathrooms) },
    ...(property.areaM2 ? [{ label: 'Área', value: `${property.areaM2} m²` }] : []),
    ...(property.floor != null ? [{ label: 'Piso', value: String(property.floor) }] : []),
    ...(property.bedType ? [{ label: 'Cama', value: BED_TYPE_LABEL[property.bedType] }] : []),
    ...(property.viewType ? [{ label: 'Vista', value: property.viewType }] : []),
    ...(property.hasElevator ? [{ label: 'Ascensor', value: 'Sí' }] : []),
    { label: 'Check-in', value: property.checkInTime },
    { label: 'Check-out', value: property.checkOutTime },
  ];

  const rules = [
    { allowed: property.petsAllowed, label: 'Mascotas' },
    { allowed: property.smokingAllowed, label: 'Fumar' },
    { allowed: property.partiesAllowed, label: 'Fiestas o eventos' },
    { allowed: property.suitableForChildren, label: 'Niños' },
  ];

  const deposit = Number(property.securityDeposit);
  const extraGuest = Number(property.extraGuestFee);
  const hasExtraFees = deposit > 0 || extraGuest > 0;
  const hasDiscounts = property.weeklyDiscount > 0 || property.monthlyDiscount > 0;

  return (
    // pt-28: deja hueco a la barra de navegación flotante.
    <div className="container-page pb-28 pt-28 lg:pb-8">
      <nav aria-label="Ruta de navegación" className="mb-5 text-sm text-ink-500">
        <Link href="/alojamientos" className="transition hover:text-ink-900">
          Alojamientos
        </Link>
        <span className="mx-2 text-ink-300">/</span>
        <Link
          href={`/alojamientos?department=${property.location.department.slug}`}
          className="transition hover:text-ink-900"
        >
          {property.location.department.name}
        </Link>
      </nav>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            {property.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-500">
            <Link href="#resenas-section" className="transition hover:opacity-70">
              <Rating value={property.ratingAvg} count={property.reviewsCount} />
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {place}
            </span>
            <Badge tone="neutral">{property.category.name}</Badge>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <Share2 className="size-4" /> Compartir
          </button>
          <button
            onClick={() => toggleFavorite.mutate(property.id)}
            aria-pressed={isFavorite}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 transition hover:bg-ink-100 hover:text-ink-900"
          >
            <Heart className={cn('size-4', isFavorite && 'fill-ink-900 text-ink-900')} />
            {isFavorite ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <PropertyGallery images={property.images} title={property.title} />

      {/* minmax(0,1fr) evita que un texto largo sin espacios ensanche la columna
          izquierda y empuje la card de reserva fuera de la pantalla. */}
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_372px] lg:gap-16">
        <div className="min-w-0 space-y-10">
          {/* Anfitrión + ficha */}
          <section>
            <div className="flex items-center gap-3">
              <Avatar
                src={property.owner.avatarUrl}
                firstName={property.owner.firstName}
                lastName={property.owner.lastName}
                size="md"
              />
              <div>
                <p className="text-sm font-medium text-ink-900">
                  {property.owner.firstName} {property.owner.lastName.charAt(0)}.
                </p>
                <p className="text-xs text-ink-500">Anfitrión</p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-10 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label} className="border-b border-ink-200 py-3">
                  <dt className="text-xs text-ink-500">{spec.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Descripción */}
          <section className={BLOCK}>
            <h2 className={HEADING}>Sobre este alojamiento</h2>
            <div className="mt-4 max-w-2xl">
              {property.description.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  className="mb-4 break-words text-sm leading-relaxed text-ink-700 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <section className={BLOCK}>
            <PropertyAmenities amenities={property.amenities.map((a) => a.amenity)} />
          </section>

          <section className={BLOCK}>
            <PropertyMap
              location={property.location}
              place={place}
              reference={property.location.reference}
            />
          </section>

          {/* Reglas */}
          <section className={BLOCK}>
            <h2 className={HEADING}>Reglas de la casa</h2>

            <ul className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
              {rules.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2.5">
                  {rule.allowed ? (
                    <Check className="size-4 shrink-0 text-ink-900" aria-hidden />
                  ) : (
                    <X className="size-4 shrink-0 text-ink-300" aria-hidden />
                  )}
                  <span className={rule.allowed ? 'text-ink-700' : 'text-ink-400'}>
                    {rule.label}
                  </span>
                </li>
              ))}

              {property.quietHoursFrom && property.quietHoursTo && (
                <li className="flex items-center gap-2.5">
                  <Moon className="size-4 shrink-0 text-ink-900" aria-hidden />
                  <span className="text-ink-700">
                    Silencio de {property.quietHoursFrom} a {property.quietHoursTo}
                  </span>
                </li>
              )}
            </ul>

            {property.houseRules && (
              <p className="mt-4 max-w-2xl whitespace-pre-line break-words text-sm leading-relaxed text-ink-600">
                {property.houseRules}
              </p>
            )}
          </section>

          {/* Cancelación */}
          <section className={BLOCK}>
            <h2 className={HEADING}>Cancelación y cobros</h2>

            <div className="mt-4 flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-900" aria-hidden />
              <p className="text-sm leading-relaxed text-ink-700">
                <span className="font-medium text-ink-900">
                  {CANCELLATION_POLICY_LABEL[property.cancellationPolicy]}.
                </span>{' '}
                {CANCELLATION_POLICY_DETAIL[property.cancellationPolicy]}
              </p>
            </div>

            {(hasExtraFees || hasDiscounts) && (
              <ul className="mt-4 space-y-1.5 text-sm text-ink-600">
                {deposit > 0 && <li>Depósito de garantía: {formatPrice(deposit)}</li>}
                {extraGuest > 0 && <li>Huésped adicional: {formatPrice(extraGuest)} por noche</li>}
                {property.weeklyDiscount > 0 && (
                  <li>{property.weeklyDiscount}% de descuento desde 7 noches</li>
                )}
                {property.monthlyDiscount > 0 && (
                  <li>{property.monthlyDiscount}% de descuento desde 28 noches</li>
                )}
              </ul>
            )}
          </section>

          {/* Reseñas */}
          <div className={BLOCK}>
            <ReviewsSection propertyId={property.id} propertyTitle={property.title} />
          </div>
        </div>

        {/* Card de reserva (sticky en desktop) */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <BookingCard property={property} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t border-ink-200 pt-10">
          <h2 className="mb-6 text-lg font-semibold text-ink-900">Alojamientos similares</h2>
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

        <button
          type="button"
          onClick={() => document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-lg bg-ink-900 px-6 py-3 text-sm font-medium text-white"
        >
          Reservar
        </button>
      </div>
    </div>
  );
}
