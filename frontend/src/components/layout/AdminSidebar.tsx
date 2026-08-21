'use client';

import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  CalendarRange,
  ChartLine,
  House,
  LayoutDashboard,
  LogOut,
  Tags,
  UserCheck,
  Wallet,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/alojamientos', label: 'Alojamientos', icon: House },
  { href: '/admin/reservas', label: 'Reservas', icon: CalendarDays },
  { href: '/admin/calendario', label: 'Calendario', icon: CalendarRange },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/anfitriones', label: 'Anfitriones', icon: UserCheck },
  { href: '/admin/pagos', label: 'Pagos', icon: Wallet },
  { href: '/admin/categorias', label: 'Categorías', icon: Tags },
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: ChartLine },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden" onClick={onClose} aria-hidden />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-200 bg-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-ink-200 px-5">
          <Link href="/">
            <Logo />
          </Link>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-ink-100 lg:hidden">
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Administración">
          <ul className="space-y-1">
            {LINKS.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors',
                      active ? 'bg-ink-900 text-white' : 'text-ink-700 hover:bg-ink-100',
                    )}
                  >
                    <link.icon className="size-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-ink-200 p-3">
          <div className="px-2 py-2">
            <p className="truncate text-sm font-medium text-ink-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-ink-500">{user?.email}</p>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-danger-700 transition hover:bg-danger-50"
          >
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
