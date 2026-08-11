'use client';

import { ErrorState, Spinner } from '@/components/ui';
import { PropertyForm } from '@/features/admin/components/PropertyForm';
import { propertiesService } from '@/features/properties/services/properties.service';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['properties', 'admin', id],
    queryFn: () => propertiesService.byId(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <Spinner label="Cargando alojamiento…" />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  return <PropertyForm property={data} />;
}
