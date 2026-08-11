import { SITE } from '@/constants';
import { PropertyDetailView } from '@/features/properties/components/PropertyDetailView';
import { propertiesServerService } from '@/features/properties/services/properties.service';
import { formatPrice } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await propertiesServerService.bySlug(slug);

  if (!property) {
    return buildMetadata({ title: 'Alojamiento no encontrado', noIndex: true });
  }

  const place = `${property.location.district?.name ?? property.location.province.name}, ${property.location.department.name}`;

  return buildMetadata({
    title: `${property.title} — ${place}`,
    description:
      property.shortDescription ??
      `${property.title} en ${place}. Hasta ${property.maxGuests} huéspedes desde ${formatPrice(property.pricePerNight)} por noche.`,
    path: `/alojamiento/${property.slug}`,
    image: property.images[0]?.url,
  });
}

export default async function PropertyPage({ params }: PageProps) {
  const { slug } = await params;

  const [property, similar] = await Promise.all([
    propertiesServerService.bySlug(slug),
    propertiesServerService.similar(slug, 4),
  ]);

  if (!property) notFound();

  const place = `${property.location.district?.name ?? property.location.province.name}, ${property.location.department.name}`;

  /** Datos estructurados para resultados enriquecidos en Google. */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.title,
    description: property.shortDescription ?? property.description.slice(0, 200),
    image: property.images.map((i) => i.url),
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.location.district?.name ?? property.location.province.name,
      addressRegion: property.location.department.name,
      addressCountry: 'PE',
    },
    priceRange: `${formatPrice(property.pricePerNight)} por noche`,
    url: `${SITE.url}/alojamiento/${property.slug}`,
    ...(property.reviewsCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: property.ratingAvg,
        reviewCount: property.reviewsCount,
        bestRating: 5,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetailView property={property} similar={similar ?? []} place={place} />
    </>
  );
}
