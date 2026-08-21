import { SITE } from '@/constants';
import type { Metadata, Viewport } from 'next';
import { Caveat } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

/**
 * Letra manuscrita, sólo para la página de planes. Va como variable CSS y no
 * como fuente del body: si fuera la tipografía por defecto, el resto del sitio
 * —que es deliberadamente sobrio— se volvería ilegible.
 */
const manuscrita = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-manuscrita',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'alquiler de casas Perú',
    'alojamientos Cusco',
    'casas de playa Perú',
    'departamentos Lima',
    'reservas online Perú',
  ],
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={manuscrita.variable}>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
