'use client';

import dynamic from 'next/dynamic';

/**
 * Envoltorio del lanyard 3D.
 *
 * Existe por dos motivos. Uno técnico: `ssr: false` sólo puede usarse desde un
 * componente de cliente, y la página de Nosotros es de servidor. Y otro de
 * peso: three, rapier y el modelo suman bastante, así que se cargan aparte y
 * después del resto de la página, no bloqueando la primera pintura.
 *
 * Mientras carga se ve el hueco vacío, sin salto de maquetación: el contenedor
 * ya reserva su altura.
 */
const Lanyard = dynamic(() => import('./Lanyard').then((m) => m.Lanyard), {
  ssr: false,
  loading: () => <div aria-hidden className="h-full w-full" />,
});

export function LanyardLazy({ className }: { className?: string }) {
  return <Lanyard className={className} />;
}
