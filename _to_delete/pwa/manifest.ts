import { SITE } from '@/constants';
import type { MetadataRoute } from 'next';

/**
 * Manifiesto de la aplicación web.
 *
 * Sirve para dos cosas a la vez: permite instalar la web como aplicación desde
 * el navegador, y es lo que lee Bubblewrap para generar el paquete de Android
 * (la TWA) que va a Google Play. El nombre, los colores y los iconos del
 * teléfono salen de aquí, no del código de la app.
 *
 * Next lo publica en /manifest.webmanifest y añade la etiqueta <link> sola.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PyFGroup — Alojamientos en Perú',
    // Lo que cabe debajo del icono en la pantalla de inicio. Doce caracteres
    // es el límite práctico antes de que Android lo recorte.
    short_name: 'PyFGroup',
    description: SITE.description,

    start_url: '/',
    // El ámbito acota qué URLs se consideran "dentro" de la app. Una fuera de
    // aquí abre el navegador, que es justo lo que queremos para pasarelas de
    // pago externas o enlaces a redes sociales.
    scope: '/',

    display: 'standalone',
    orientation: 'portrait',

    background_color: '#ffffff',
    // Tiñe la barra de estado del teléfono. Va oscuro, como la marca.
    theme_color: '#171717',

    lang: 'es-PE',
    dir: 'ltr',
    categories: ['travel', 'lifestyle'],

    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // El enmascarable lleva margen extra: Android recorta las esquinas y,
      // según el fabricante, hasta un 20% por lado. Sin ese aire, el logo sale
      // con las puntas cortadas.
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],

    // Accesos directos al mantener pulsado el icono en el teléfono.
    shortcuts: [
      { name: 'Alojamientos', url: '/alojamientos' },
      { name: 'Mis reservas', url: '/mis-reservas' },
    ],
  };
}
