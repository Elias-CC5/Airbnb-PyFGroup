import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
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

export const hostService = {
  me: () => api.get<MyHostStatus>(ENDPOINTS.hosts.me),

  apply: (input: HostApplicationInput) =>
    api.post<{ id: string; status: HostApplicationStatus; message: string }>(
      ENDPOINTS.hosts.applications,
      input,
    ),
};
