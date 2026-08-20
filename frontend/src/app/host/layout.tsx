'use client';

import { HostSidebar } from '@/components/layout/HostSidebar';
import { RequireAuth } from '@/components/shared/RequireAuth';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <RequireAuth host>
      <div className="min-h-dvh bg-ink-50">
        <HostSidebar open={open} onClose={() => setOpen(false)} />

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-ink-200 bg-white/85 px-5 backdrop-blur-md lg:hidden">
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              className="grid size-10 place-items-center rounded-full hover:bg-ink-100"
            >
              <Menu className="size-5" />
            </button>
            <span className="font-semibold text-ink-900">Panel del anfitrión</span>
          </header>

          <main id="contenido" className="p-5 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
