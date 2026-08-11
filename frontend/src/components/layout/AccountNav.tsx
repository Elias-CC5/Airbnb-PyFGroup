'use client';

import { cn } from '@/lib/utils';
import { CalendarCheck, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/perfil', label: 'Mi perfil', icon: User },
  { href: '/mis-reservas', label: 'Mis reservas', icon: CalendarCheck },
  { href: '/favoritos', label: 'Favoritos', icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Mi cuenta">
      <ul className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col lg:gap-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-colors',
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
  );
}
