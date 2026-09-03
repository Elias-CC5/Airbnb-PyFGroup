'use client';

import { useEffect } from 'react';

/**
 * Registra el service worker.
 *
 * Sólo en producción y sólo si el navegador lo soporta. En desarrollo estorba:
 * te sirve versiones cacheadas mientras editas y acabas persiguiendo fantasmas.
 *
 * Si el registro falla, no pasa nada: la web funciona igual. El service worker
 * añade capacidad sin conexión e instalación, no es un requisito para navegar.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const registrar = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silencioso a propósito: un fallo aquí no debe ensuciar la consola
        // del visitante ni romper nada.
      });
    };

    // Se espera al load para no competir por ancho de banda con lo que sí
    // hace falta para pintar la página.
    if (document.readyState === 'complete') registrar();
    else window.addEventListener('load', registrar, { once: true });

    return () => window.removeEventListener('load', registrar);
  }, []);

  return null;
}
