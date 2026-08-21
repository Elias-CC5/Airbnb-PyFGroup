import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';

export type PaymentMethod = 'YAPE' | 'PLIN' | 'TRANSFER' | 'CASH';

export type SubscriptionStatus =
  | 'PENDING_PAYMENT'
  | 'IN_REVIEW'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CANCELLED';

export interface HostPlan {
  id: string;
  code: string;
  name: string;
  days: number;
  price: string | number;
  currency: string;
  tagline: string | null;
  features: string[];
  isPopular: boolean;
  sortOrder: number;
}

export interface HostSubscription {
  id: string;
  status: SubscriptionStatus;
  startsAt: string | null;
  endsAt: string | null;
  amount: string | number;
  method: PaymentMethod | null;
  operationNumber: string | null;
  proofUrl: string | null;
  rejectionReason: string | null;
  reportedAt: string | null;
  plan: HostPlan;
}

export interface MyPlan {
  isSubscribed: boolean;
  subscription: HostSubscription | null;
  pending: HostSubscription | null;
  properties: { published: number; total: number };
  freeLimit: number;
  /** null cuando tiene plan: sin límite. */
  slotsLeft: number | null;
  freeSlotPropertyId: string | null;
}

export interface PendingPayment extends HostSubscription {
  hostProfile: {
    id: string;
    displayName: string;
    user: { id: string; email: string; firstName: string; lastName: string };
  };
}

interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const hostPlansService = {
  plans: () => api.get<HostPlan[]>(ENDPOINTS.hosts.plans),

  myPlan: () => api.get<MyPlan>(ENDPOINTS.hosts.subscription),

  subscribe: (planId: string) =>
    api.post<HostSubscription>(ENDPOINTS.hosts.subscription, { planId }),

  reportPayment: (
    id: string,
    payload: {
      method: PaymentMethod;
      operationNumber: string;
      /** Captura del Yape/Plin como data URI. Se adjunta al correo del equipo. */
      proofImage?: string;
      proofUrl?: string;
      paidAt?: string;
    },
  ) => api.patch<HostSubscription>(ENDPOINTS.hosts.subscriptionPayment(id), payload),

  cancel: (id: string) => api.patch<HostSubscription>(ENDPOINTS.hosts.subscriptionCancel(id)),

  chooseFreeSlot: (propertyId: string) =>
    api.patch<{ freeSlotPropertyId: string }>(ENDPOINTS.hosts.freeSlot, { propertyId }),
};

export const adminPaymentsService = {
  pending: (query: Record<string, unknown> = {}) =>
    api.get<Page<PendingPayment>>(ENDPOINTS.admin.hostPayments, { query }),

  review: (id: string, approve: boolean, rejectionReason?: string) =>
    api.patch<HostSubscription>(ENDPOINTS.admin.hostPaymentReview(id), {
      approve,
      rejectionReason,
    }),

  registerCash: (hostProfileId: string, planId: string, notes?: string) =>
    api.post<HostSubscription>(ENDPOINTS.admin.hostPaymentCash, {
      hostProfileId,
      planId,
      notes,
    }),
};
