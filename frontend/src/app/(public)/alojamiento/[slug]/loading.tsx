import { Skeleton } from '@/components/ui';

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="h-8 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-4 w-48" />
      <Skeleton className="mt-6 h-[420px] w-full rounded-3xl" />
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_384px]">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    </div>
  );
}
