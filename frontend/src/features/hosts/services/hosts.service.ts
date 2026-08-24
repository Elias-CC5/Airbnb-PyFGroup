import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';

export type HostApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
export type HostStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
export type IdDocumentType = 'DNI' | 'CARNET_EXTRANJERIA' | 'PASAPORTE';

export interface HostApplication {
  id: string;
  status: HostApplicationStatus;
  fullName: string;
  phone: string;
  occupation: string | null;
  motivation: string;
  city: string | null;
  documentType: IdDocumentType;
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  documentsPurgedAt: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  reviewedBy: { id: string; email: string } | null;
}

/** Datos de identidad. Sólo llegan cuando el admin los pide explícitamente. */
export interface HostDocuments {
  documentType: IdDocumentType;
  documentNumber: string;
  documentFrontUrl: string | null;
  documentBackUrl: string | null;
  selfieUrl: string | null;
  documentsPurgedAt: string | null;
}

export interface HostDocumentAccess {
  viewedAt: string;
  ip: string | null;
  viewedBy: { id: string; email: string };
}

export interface HostSummary {
  id: string;
  displayName: string;
  city: string | null;
  status: HostStatus;
  hostSince: string | null;
  ratingAvg: number;
  reviewsCount: number;
  propertiesCount: number;
  suspendedReason: string | null;
  user: { id: string; email: string; firstName: string; lastName: string };
  /** Plan vigente, si lo hay. Llega con un solo elemento como mucho. */
  subscriptions: Array<{
    id: string;
    startsAt: string | null;
    endsAt: string | null;
    plan: { name: string; days: number };
  }>;
}

interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const hostsAdminService = {
  applications: (query: Record<string, unknown>) =>
    api.get<Page<HostApplication>>(ENDPOINTS.admin.hostApplications, { query }),

  documents: (id: string) =>
    api.get<HostDocuments>(ENDPOINTS.admin.hostApplicationDocuments(id)),

  accessLog: (id: string) =>
    api.get<HostDocumentAccess[]>(ENDPOINTS.admin.hostApplicationAccessLog(id)),

  review: (id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) =>
    api.patch<{ id: string; status: HostApplicationStatus }>(
      ENDPOINTS.admin.hostApplicationReview(id),
      { status, rejectionReason },
    ),

  hosts: (query: Record<string, unknown>) =>
    api.get<Page<HostSummary>>(ENDPOINTS.admin.hosts, { query }),

  suspend: (id: string, reason: string) =>
    api.patch<{ id: string }>(ENDPOINTS.admin.hostSuspend(id), { reason }),

  reactivate: (id: string) => api.patch<{ id: string }>(ENDPOINTS.admin.hostReactivate(id)),
};
