import { buildMetadata } from '@/lib/seo';
import { Suspense } from 'react';
import { PropertyGridSkeleton } from '@/components/ui';
import { PropertiesResults } from '@/features/properties/components/PropertiesResults';

export const metadata = buildMetadata({
  title: 'Alojamientos en alquiler en Perú',
  description:
    'Explora casas, departamentos, cabañas y villas disponibles en todo el Perú. Filtra por destino, fechas, precio y comodidades.',
  path: '/alojamientos',
});

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="container-page py-10"><PropertyGridSkeleton /></div>}>
      <PropertiesResults />
    </Suspense>
  );
}
