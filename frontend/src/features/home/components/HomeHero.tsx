'use client';

import { SpotlightHero } from '@/components/ui/SpotlightHero';

/**
 * Las dos fotos de la portada. Van fijas y no salen del catálogo a propósito:
 * el efecto sólo funciona si las dos encajan entre sí, y si dependieran de los
 * destacados cambiarían solas cada vez que se mueve el catálogo.
 */
const BASE =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85';

const REVELADO =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85';

export function HomeHero() {
  return (
    <SpotlightHero
      baseImage={BASE}
      revealImage={REVELADO}
      eyebrow="Ponce & Figueroa Group S.A.C."
      titleTop="Bienvenido a"
      titleBottom="P&F GROUP"
      intro="Departamentos amoblados en Perú que administramos nosotros mismos: los preparamos, los limpiamos entre estadías y respondemos el teléfono cuando hace falta."
      pitch="Reserva en línea, paga en soles y coordina la llegada directo con nosotros. Sin comisiones escondidas ni intermediarios."
      facts={['Lima, Perú', 'Reserva directa', 'Pago en soles']}
      cta={{ label: 'Ver alojamientos', href: '/alojamientos' }}
    />
  );
}
