'use client';

import { Avatar, Button, Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui';
import { NAV_LINKS, SITE } from '@/constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { CalendarCheck, Heart, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  /** Sobre el hero oscuro la píldora va en modo oscuro; al bajar, se aclara. */
  const onDark = !scrolled;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 px-4 sm:top-4">
      <div className="container-page">
        <nav
          aria-label="Principal"
          className={cn(
            'pointer-events-auto flex h-16 items-center justify-between gap-6 rounded-full pl-5 pr-3',
            'border backdrop-blur-xl transition-[background-color,border-color,box-shadow,color] duration-500',
            onDark
              ? 'border-white/15 bg-ink-950/35 text-white shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]'
              : 'border-ink-200/70 bg-white/80 text-ink-900 shadow-[0_8px_30px_-14px_rgba(28,25,23,0.35)]',
          )}
        >
          <Link
            href="/"
            aria-label={`${SITE.name} — Inicio`}
            className={cn('shrink-0 transition-colors', onDark && '[&_span]:text-white')}
          >
            <Logo />
          </Link>

          {/* Enlaces */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm transition-colors duration-300',
                      active
                        ? onDark
                          ? 'bg-white/15 font-medium text-white'
                          : 'bg-ink-100 font-medium text-ink-900'
                        : onDark
                          ? 'text-white/70 hover:bg-white/10 hover:text-white'
                          : 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Cuenta */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Dropdown
                trigger={
                  <span
                    className={cn(
                      'flex items-center gap-2 rounded-full border py-1.5 pl-3 pr-1.5 transition duration-300',
                      onDark
                        ? 'border-white/20 hover:bg-white/10'
                        : 'border-ink-200 hover:bg-ink-50 hover:shadow-sm',
                    )}
                  >
                    <Menu className={cn('size-4', onDark ? 'text-white/80' : 'text-ink-600')} />
                    <Avatar
                      src={user?.avatarUrl}
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      size="sm"
                    />
                  </span>
                }
              >
                {(close) => (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-ink-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="truncate text-xs text-ink-500">{user?.email}</p>
                    </div>
                    <DropdownSeparator />

                    {isAdmin && (
                      <>
                        <Link href="/admin" onClick={close}>
                          <DropdownItem>
                            <LayoutDashboard className="size-4" /> Panel de administración
                          </DropdownItem>
                        </Link>
                        <DropdownSeparator />
                      </>
                    )}

                    <Link href="/perfil" onClick={close}>
                      <DropdownItem>
                        <User className="size-4" /> Mi perfil
                      </DropdownItem>
                    </Link>
                    <Link href="/mis-reservas" onClick={close}>
                      <DropdownItem>
                        <CalendarCheck className="size-4" /> Mis reservas
                      </DropdownItem>
                    </Link>
                    <Link href="/favoritos" onClick={close}>
                      <DropdownItem>
                        <Heart className="size-4" /> Favoritos
                      </DropdownItem>
                    </Link>

                    <DropdownSeparator />
                    <DropdownItem
                      onClick={() => logout.mutate()}
                      className="text-danger-700 hover:bg-danger-50"
                    >
                      <LogOut className="size-4" /> Cerrar sesión
                    </DropdownItem>
                  </>
                )}
              </Dropdown>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'hidden rounded-full sm:inline-flex',
                    onDark && 'text-white/85 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/registro">Registrarse</Link>
                </Button>
              </>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              className={cn(
                'grid size-10 place-items-center rounded-full transition lg:hidden',
                onDark ? 'text-white hover:bg-white/10' : 'text-ink-700 hover:bg-ink-100',
              )}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        {/* Menú móvil: tarjeta de cristal bajo la píldora */}
        {mobileOpen && (
          <div className="pointer-events-auto mt-2 overflow-hidden rounded-3xl border border-ink-200/70 bg-white/90 shadow-lg backdrop-blur-xl lg:hidden">
            <ul className="flex flex-col p-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-2xl px-4 py-3 text-sm text-ink-800 transition hover:bg-ink-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {!isAuthenticated && (
                <li>
                  <Link
                    href="/login"
                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-clay-700 transition hover:bg-clay-50"
                  >
                    Iniciar sesión
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}