'use client';

import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { CloudOff } from 'lucide-react';

export function ErrorState({
  title = 'Ocurrió un error',
  description = 'No pudimos cargar la información. Revisa tu conexión e inténtalo nuevamente.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<CloudOff className="size-6" />}
      title={title}
      description={description}
      action={onRetry && <Button variant="outline" onClick={onRetry}>Intentar nuevamente</Button>}
    />
  );
}
