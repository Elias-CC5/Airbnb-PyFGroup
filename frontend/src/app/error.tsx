'use client';

import { Button } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-page flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-danger-50 text-danger-700">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-ink-900">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-ink-600">
        Ocurrió un error inesperado. Intenta nuevamente; si continúa, escríbenos por WhatsApp.
      </p>
      <Button onClick={reset} className="mt-8">
        Intentar nuevamente
      </Button>
    </main>
  );
}
