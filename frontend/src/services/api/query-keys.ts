/** Claves de caché de React Query centralizadas para invalidaciones consistentes. */
export const queryKeys = {
  properties: {
    all: ['properties'] as const,
    list: (filters: Record<string, unknown>) => ['properties', 'list', filters] as const,
    featured: ['properties', 'featured'] as const,
    detail: (slug: string) => ['properties', 'detail', slug] as const,
    similar: (slug: string) => ['properties', 'similar', slug] as const,
  },
  categories: { all: ['categories'] as const, admin: ['categories', 'admin'] as const },
  amenities: { all: ['amenities'] as const, grouped: ['amenities', 'grouped'] as const },
  locations: {
    departments: ['locations', 'departments'] as const,
    provinces: (id: number) => ['locations', 'provinces', id] as const,
    districts: (id: number) => ['locations', 'districts', id] as const,
  },
  availability: {
    occupied: (id: string) => ['availability', 'occupied', id] as const,
  },
  reservations: {
    mine: (filters: Record<string, unknown>) => ['reservations', 'mine', filters] as const,
    admin: (filters: Record<string, unknown>) => ['reservations', 'admin', filters] as const,
    detail: (id: string) => ['reservations', 'detail', id] as const,
  },
  reviews: {
    byProperty: (id: string, page: number) => ['reviews', id, page] as const,
    summary: (id: string) => ['reviews', 'summary', id] as const,
    mine: ['reviews', 'mine'] as const,
  },
  favorites: { list: ['favorites'] as const, ids: ['favorites', 'ids'] as const },
  users: { list: (filters: Record<string, unknown>) => ['users', filters] as const, stats: ['users', 'stats'] as const },
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    reservationsSeries: ['admin', 'reservations-series'] as const,
    usersSeries: ['admin', 'users-series'] as const,
    topProperties: ['admin', 'top-properties'] as const,
    propertyPerformance: ['admin', 'property-performance'] as const,
    channelSeries: ['admin', 'channel-series'] as const,
    recent: ['admin', 'recent'] as const,
    hostApplications: (filters: Record<string, unknown>) =>
      ['admin', 'host-applications', filters] as const,
    hostDocuments: (id: string) => ['admin', 'host-documents', id] as const,
    hostAccessLog: (id: string) => ['admin', 'host-access-log', id] as const,
    hosts: (filters: Record<string, unknown>) => ['admin', 'hosts', filters] as const,
  },
  hosts: {
    me: ['hosts', 'me'] as const,
    profile: (id: string) => ['hosts', 'profile', id] as const,
  },
} as const;
