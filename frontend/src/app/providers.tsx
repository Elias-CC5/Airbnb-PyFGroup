'use client';

import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap';
import { createQueryClient } from '@/lib/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';

function SessionBootstrap() {
  useSessionBootstrap();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap />
      {children}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { borderRadius: '14px', fontSize: '0.875rem' } }}
      />
    </QueryClientProvider>
  );
}
