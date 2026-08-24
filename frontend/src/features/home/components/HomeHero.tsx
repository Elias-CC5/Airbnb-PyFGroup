'use client';

import { VideoHero } from '@/components/ui/VideoHero';

/**
 * Vídeo temporal, prestado para ver el efecto en marcha. Reemplazar por uno
 * propio de los departamentos: MP4 (H.264), sin audio, en bucle corto y
 * comprimido —por encima de unos 6 MB el móvil tarda demasiado en arrancarlo.
 */
const VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4';

export function HomeHero() {
  return (
    <VideoHero
      videoSrc={VIDEO}
      eyebrow="Alojamientos en Perú"
      titleTop="Premium."
      titleBottom="Accesible."
      subtitle="Departamentos amoblados que administramos nosotros mismos, de principio a fin."
      secondary={{ label: 'Descubrir', href: '/alojamientos' }}
      primary={{ label: 'Reservar ahora', href: '/alojamientos' }}
    />
  );
}
