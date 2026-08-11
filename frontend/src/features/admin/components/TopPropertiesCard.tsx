'use client';

import { Card, CardContent, CardHeader, CardTitle, Rating, Skeleton } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import { Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { TopProperty } from '../services/admin.service';

export function TopPropertiesCard({ data, loading }: { data?: TopProperty[]; loading?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alojamientos más vistos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {data?.map((property) => (
              <li key={property.id}>
                <Link
                  href={`/alojamiento/${property.slug}`}
                  className="flex items-center gap-3.5 rounded-xl p-2 transition hover:bg-ink-50"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                    {property.images[0] && (
                      <Image src={property.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-900">{property.title}</span>
                    <span className="flex items-center gap-3 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" /> {property.views}
                      </span>
                      <Rating value={property.ratingAvg} count={property.reviewsCount} />
                      <span>{property._count.reservations} reservas</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-ink-900">
                    {formatPrice(property.pricePerNight)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
