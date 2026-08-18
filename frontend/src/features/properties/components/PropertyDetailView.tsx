'use client';

import { Avatar, Badge, Rating } from '@/components/ui';
import { useFavoriteIds, useToggleFavorite } from '@/features/favorites/hooks/useFavorites';
import { BookingCard } from '@/features/reservations/components/BookingCard';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { BED_TYPE_LABEL, CANCELLATION_POLICY_DETAIL, CANCELLATION_POLICY_LABEL } from '@/constants';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PropertyCard as PropertyCardType, PropertyDetail } from '@/types';
import { Check, Heart, MapPin, Moon, Share2, ShieldCheck, Star, X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
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

/** Encabezado editorial: número de sección + título en serif. */
function SectionTitle({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <span className="block font-mono text-xs tracking-[0.2em] text-ink-400">{index}</span>
      <h2 className="mt-2 text-display text-2xl text-ink-900 sm:text-3xl">{children}</h2>
    </div>
  );
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

  /** Ficha técnica en pares etiqueta/valor: se lee como un plano, no como una lista. */
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
    <div className="container-page pb-28 pt-28 lg:pb-8">
      {/* Barra superior: ruta + acciones */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Ruta de navegación" className="font-mono text-xs tracking-wide text-ink-400">
          <Link href="/alojamientos" className="transition hover:text-ink-900">
            ALOJAMIENTOS
          </Link>
          <span className="mx-2">—</span>
          <Link
            href={`/alojamientos?department=${property.location.department.slug}`}
            className="transition hover:text-ink-900"
          >
            {property.location.department.name.toUpperCase()}
          </Link>
        </nav>

        <div className="flex gap-1">
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-3.5 py-1.5 text-xs text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
          >
            <Share2 className="size-3.5" /> Compartir
          </button>
          <button
            onClick={() => toggleFavorite.mutate(property.id)}
            aria-pressed={isFavorite}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-3.5 py-1.5 text-xs text-ink-700 transition hover:border-ink-900 hover:text-ink-900"
          >
            <Heart className={cn('size-3.5', isFavorite && 'fill-ink-900 text-ink-900')} />
            {isFavorite ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      <PropertyGallery images={property.images} title={property.title} />

      {/* Título editorial bajo la galería */}
      <header className="mt-10 border-b border-ink-900 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="dark">{property.category.name}</Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-500">
            <MapPin className="size-3.5" /> {place}
          </span>
          {property.reviewsCount > 0 && (
            <Link
              href="#resenas-section"
              className="inline-flex items-center gap-1.5 text-xs text-ink-500 transition hover:text-ink-900"
            >
              <Star className="size-3.5 fill-ink-900 text-ink-900" />
              {property.ratingAvg.toFixed(1)} · {property.reviewsCount} reseñas
            </Link>
          )}
        </div>

        <h1 className="mt-4 max-w-3xl text-display text-4xl leading-[1.05] text-ink-900 sm:text-5xl lg:text-6xl">
          {property.title}
        </h1>
      </header>

      {/* Contenido + card de reserva */}
      {/* minmax(0,1fr) evita que un texto largo sin espacios ensanche la columna
          izquierda y empuje la card de reserva fuera de la pantalla. */}
      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-20">
        <div className="min-w-0 space-y-16">
          {/* 01 — Ficha técnica + anfitrión */}
          <section>
            <SectionTitle index="01">La ficha</SectionTitle>

            <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-14">
              <dl className="grid grid-cols-2 gap-x-8">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-3 border-b border-ink-200 py-2.5"
                  >
                    <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-400">
                      {spec.label}
                    </dt>
                    <dd className="text-sm font-medium text-ink-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex items-center gap-4 self-start rounded-2xl border border-ink-200 p-5 sm:w-44 sm:flex-col sm:text-center">
                <Avatar
                  src={property.owner.avatarUrl}
                  firstName={property.owner.firstName}
                  lastName={property.owner.lastName}
                  size="lg"
                />
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-wider text-ink-400">
                    Anfitrión
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink-900">
                    {property.owner.firstName} {property.owner.lastName.charAt(0)}.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 02 — Descripción */}
          <section>
            <SectionTitle index="02">El espacio</SectionTitle>
            <div className="max-w-2xl">
              {property.description.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  className={cn(
                    'mb-5 break-words leading-[1.75] text-ink-700 last:mb-0',
                    i === 0 ? 'text-lg text-ink-900' : 'text-[0.95rem]',
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          {/* 03 — Servicios */}
          <section>
            <PropertyAmenities amenities={property.amenities.map((a) => a.amenity)} index="03" />
          </section>

          {/* 04 — Ubicación */}
          <section>
            <PropertyMap
              location={property.location}
              place={place}
              reference={property.location.reference}
              index="04"
            />
          </section>

          {/* 05 — Reglas y condiciones */}
          <section>
            <SectionTitle index="05">Reglas y condiciones</SectionTitle>

            <ul className="grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
              {rules.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2.5">
                  {rule.allowed ? (
                    <Check className="size-4 shrink-0 text-ink-900" aria-hidden />
                  ) : (
                    <X className="size-4 shrink-0 text-ink-300" aria-hidden />
                  )}
                  <span className={cn(!rule.allowed && 'text-ink-400 line-through')}>
                    {rule.label}
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
              <p className="mt-5 max-w-2xl whitespace-pre-line break-words text-sm leading-relaxed text-ink-600">
                {property.houseRules}
              </p>
            )}

            <div className="mt-8 rounded-2xl bg-ink-50 p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink-900" aria-hidden />
                <p className="text-sm leading-relaxed text-ink-700">
                  <span className="font-medium text-ink-900">
                    {CANCELLATION_POLICY_LABEL[property.cancellationPolicy]}.
                  </span>{' '}
                  {CANCELLATION_POLICY_DETAIL[property.cancellationPolicy]}
                </p>
              </div>

              {(hasExtraFees || hasDiscounts) && (
                <ul className="mt-4 space-y-1.5 border-t border-ink-200 pt-4 text-sm text-ink-600">
                  {deposit > 0 && <li>Depósito de garantía: {formatPrice(deposit)}</li>}
                  {extraGuest > 0 && (
                    <li>Huésped adicional: {formatPrice(extraGuest)} por noche</li>
                  )}
                  {property.weeklyDiscount > 0 && (
                    <li>{property.weeklyDiscount}% de descuento desde 7 noches</li>
                  )}
                  {property.monthlyDiscount > 0 && (
                    <li>{property.monthlyDiscount}% de descuento desde 28 noches</li>
                  )}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Card de reserva (sticky en desktop) */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <BookingCard property={property} />
        </aside>
      </div>

      {/* 06 — Reseñas, a todo el ancho */}
      <div className="mt-20 border-t border-ink-900 pt-12">
        <ReviewsSection propertyId={property.id} propertyTitle={property.title} index="06" />
      </div>

      {similar.length > 0 && (
        <section className="mt-20 border-t border-ink-200 pt-12">
          <span className="block font-mono text-xs tracking-[0.2em] text-ink-400">07</span>
          <h2 className="mb-8 mt-2 text-display text-2xl text-ink-900 sm:text-3xl">
            También te puede gustar
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

        <button
          type="button"
          onClick={() => document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth' })}
          className="rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white"
        >
          Reservar
        </button>
      </div>
    </div>
  );
}
