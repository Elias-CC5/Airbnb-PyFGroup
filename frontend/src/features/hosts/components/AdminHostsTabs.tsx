'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { HostApplicationsInbox } from './HostApplicationsInbox';
import { HostPlansTable } from './HostPlansTable';

const PESTANAS = [
  { id: 'solicitudes', label: 'Solicitudes' },
  { id: 'planes', label: 'Planes' },
] as const;

type Pestana = (typeof PESTANAS)[number]['id'];

/**
 * Dos vistas sobre lo mismo: quién quiere entrar y quién ya está dentro.
 * Se separan porque el trabajo diario es distinto — las solicitudes se revisan
 * una vez, los planes se vigilan.
 */
export function AdminHostsTabs() {
  const [activa, setActiva] = useState<Pestana>('solicitudes');

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 border-b border-ink-200">
        {PESTANAS.map((pestana) => (
          <button
            key={pestana.id}
            type="button"
            onClick={() => setActiva(pestana.id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors',
              activa === pestana.id
                ? 'border-ink-900 font-medium text-ink-900'
                : 'border-transparent text-ink-500 hover:text-ink-800',
            )}
          >
            {pestana.label}
          </button>
        ))}
      </nav>

      {activa === 'solicitudes' ? <HostApplicationsInbox /> : <HostPlansTable />}
    </div>
  );
}
