import { PropertyGridSkeleton } from '@/components/ui';
import type { PropertyCard as PropertyCardType } from '@/types';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
  properties: PropertyCardType[];
  loading?: boolean;
  skeletonCount?: number;
}

export function PropertyGrid({ properties, loading, skeletonCount = 8 }: PropertyGridProps) {
  if (loading) return <PropertyGridSkeleton count={skeletonCount} />;

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property, index) => (
        <PropertyCard key={property.id} property={property} priority={index < 4} />
      ))}
    </div>
  );
}
