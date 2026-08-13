import { api } from '@/lib/api-client';

export type ComplaintType = 'RECLAMO' | 'QUEJA';

export interface CreateComplaintInput {
  type: ComplaintType;
  fullName: string;
  docType: string;
  docNumber: string;
  address: string;
  phone?: string;
  email: string;
  itemDescription: string;
  amount?: number;
  reservationCode?: string;
  detail: string;
  request: string;
}

export interface Complaint extends CreateComplaintInput {
  id: string;
  code: string;
  status: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

export const complaintsService = {
  create: (input: CreateComplaintInput) =>
    api.post<Complaint>('/complaints', input, { auth: false }),
  findByCode: (code: string) =>
    api.get<Complaint>(`/complaints/code/${code}`, { auth: false }),
};