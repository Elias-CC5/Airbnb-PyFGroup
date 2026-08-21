import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import type { Paginated, Reservation } from '@/types';
import type { HostApplicationStatus, HostStatus, IdDocumentType } from './hosts.service';

export interface MyHostStatus {
  isHost: boolean;
  status: HostStatus | null;
  canApply: boolean;
  profile: {
    id: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    city: string | null;
    country: string;
    hostSince: string | null;
    propertiesCount: number;
    status?: HostStatus;
  } | null;
  application: {
    id: string;
    status: HostApplicationStatus;
    submittedAt: string;
    reviewedAt: string | null;
    rejectionReason: string | null;
  } | null;
}

export interface HostApplicationInput {
  fullName: string;
  phone: string;
  documentType: IdDocumentType;
  documentNumber: string;
  occupation?: string;
  motivation: string;
  city?: string;
}

/** Lo que edita el anfitrión desde su panel. `languages` viaja como texto. */
export interface HostProfileInput {
  displayName: string;
  bio?: string;
  city?: string;
  country?: string;
  languages?: string;
  whatsapp?: string;
  contactEmail?: string;
}

export interface HostProfile {
  id: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  country: string;
  languages: string[];
  status: HostStatus;
  hostSince: string | null;
  whatsapp: string | null;
  contactEmail: string | null;
  ratingAvg: number;
  reviewsCount: number;
  propertiesCount: number;
}

/** Campos que el backend rechaza si llegan vacíos: mejor no enviarlos. */
const limpiar = (valor?: string) => {
  const texto = valor?.trim();
  return texto ? texto : undefined;
};

export const hostService = {
  me: () => api.get<MyHostStatus>(ENDPOINTS.hosts.me),

  apply: (input: HostApplicationInput) =>
    api.post<{ id: string; status: HostApplicationStatus; message: string }>(
      ENDPOINTS.hosts.applications,
      input,
    ),

  myProfile: () => api.get<HostProfile>(ENDPOINTS.hosts.myProfile),

  /** Reservas de los alojamientos del anfitrión. El filtro por dueño va en el backend. */
  reservations: (query: Record<string, unknown>) =>
    api.get<Paginated<Reservation>>(ENDPOINTS.hosts.reservations, { query }),

  updateMyProfile: (input: HostProfileInput) =>
    api.patch<HostProfile>(ENDPOINTS.hosts.myProfile, {
      displayName: input.displayName.trim(),
      bio: limpiar(input.bio),
      city: limpiar(input.city),
      country: limpiar(input.country),
      // El backend espera un array de idiomas, no una cadena.
      languages: input.languages
        ?.split(',')
        .map((idioma) => idioma.trim())
        .filter(Boolean),
      whatsapp: limpiar(input.whatsapp),
      contactEmail: limpiar(input.contactEmail),
    }),
};
