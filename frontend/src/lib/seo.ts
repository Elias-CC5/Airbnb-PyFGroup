import type { Metadata } from 'next';
import { SITE } from '@/constants';

interface SeoInput {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/** Constructor único de metadata para mantener el SEO consistente en todo el sitio. */
export function buildMetadata({ title, description, path = '/', image, noIndex }: SeoInput): Metadata {
  const url = `${SITE.url}${path}`;
  const desc = description ?? SITE.description;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: SITE.locale,
      siteName: SITE.name,
      title,
      description: desc,
      url,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: image ? [image] : undefined,
    },
  };
}
