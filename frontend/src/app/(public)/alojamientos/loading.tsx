import { PropertyGridSkeleton, Skeleton } from '@/components/ui';

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mx-auto h-20 max-w-4xl rounded-3xl" />
      <div className="mt-10">
        <PropertyGridSkeleton />
      </div>
    </div>
  );
}
