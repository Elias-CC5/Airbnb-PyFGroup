'use client';

import { Avatar, Button, Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui';
import { NAV_LINKS, SITE } from '@/constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BadgeCheck, CalendarCheck, Heart, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const isHost = isAdmin || user?.role === 'HOST';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  /**
   * En la portada, mientras no se ha bajado, la barra flota sobre una foto
   * oscura a pantalla completa. Con el cristal claro de siempre los enlaces
   * quedan casi ilegibles, así que ahí se invierte: cristal oscuro y texto
   * blanco. Al scrollear vuelve al claro de todo el sitio.
   */
  const sobreOscuro = pathname === '/' && !scrolled;

  // Springs con carácter, pero contenidos: nada de rebote payaso.
  const springSnappy = { type: 'spring', stiffness: 420, damping: 32, mass: 0.6 } as const;
  const springSoft = { type: 'spring', stiffness: 260, damping: 28 } as const;

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { ...springSoft, delay: 0.05 }}
      className="pointer-events-none fixed inset-x-0 top-3 z-40 px-4 sm:top-5"
    >
      <div
        className={cn(
          'mx-auto transition-[max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          scrolled ? 'max-w-5xl' : 'max-w-6xl',
        )}
      >
        <nav
          aria-label="Principal"
          className={cn(
            'pointer-events-auto relative flex items-center justify-between gap-6 rounded-full pl-5 pr-2',
            // El desenfoque fuerte con saturación es lo que convierte un panel
            // translúcido en algo que parece vidrio: recoge el color de lo que
            // tiene detrás en vez de limitarse a atenuarlo.
            'backdrop-blur-2xl backdrop-saturate-[1.8] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'ring-1 ring-inset',
            scrolled
              ? 'h-14 bg-white/70 ring-white/60 shadow-[0_10px_40px_-14px_rgba(28,25,23,0.28)]'
              : sobreOscuro
                ? 'h-16 bg-white/[0.07] ring-white/25 shadow-[0_8px_36px_-10px_rgba(0,0,0,0.55)]'
                : 'h-16 bg-white/50 ring-white/60 shadow-[0_6px_28px_-16px_rgba(28,25,23,0.22)]',
          )}
        >
          {/*
            Reflejo: una franja clara pegada al borde de arriba. Es lo que hace
            que el panel se lea como una lámina de vidrio y no como un
            rectángulo semitransparente.
          */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/25 to-transparent"
          />

          <motion.div whileHover={reduceMotion ? undefined : { scale: 1.04 }} whileTap={reduceMotion ? undefined : { scale: 0.96 }} transition={springSnappy}>
            <Link href="/" aria-label={`${SITE.name} — Inicio`} className="block shrink-0">
              {/* `invert` deja el cuadro en blanco y el monograma oscuro. */}
              <Logo className={cn('transition-[filter] duration-500', sobreOscuro && 'invert')} />
            </Link>
          </motion.div>

          {/* Enlaces */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link, i) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

              return (
                <motion.li
                  key={link.href}
                  initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { ...springSoft, delay: 0.08 + i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm transition-colors duration-300',
                      sobreOscuro
                        ? active
                          ? 'font-medium text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        : active
                          ? 'font-medium text-ink-900'
                          : 'text-ink-500 hover:bg-ink-900/[0.04] hover:text-ink-900',
                    )}
                  >
                    {link.label}
                    {/* El punto activo "fluye" de un link a otro con layoutId. */}
                    {active && (
                      <motion.span
                        layoutId="nav-active-dot"
                        aria-hidden
                        transition={reduceMotion ? { duration: 0 } : springSnappy}
                        className={cn(
                          'absolute inset-x-0 -bottom-0.5 mx-auto size-1 rounded-full',
                          sobreOscuro ? 'bg-white' : 'bg-clay-600',
                        )}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          {/* Cuenta */}
          <div className="flex items-center gap-1.5">
            <Link
              href={isHost ? '/host' : '/conviertete-en-anfitrion'}
              className={cn(
                'mr-1 hidden rounded-full px-3.5 py-2 text-sm transition-colors duration-300 md:inline-block',
                sobreOscuro
                  ? 'text-white/75 hover:bg-white/10 hover:text-white'
                  : 'text-ink-600 hover:bg-ink-900/[0.04] hover:text-ink-900',
              )}
            >
              {isHost ? 'Modo anfitrión' : 'Conviértete en anfitrión'}
            </Link>

            {isAuthenticated ? (
              <Dropdown
                trigger={
                  <motion.span
                    whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    transition={springSnappy}
                    className={cn(
                      'flex items-center gap-2 rounded-full border py-1 pl-3 pr-1 transition-[border-color,box-shadow] duration-300 hover:shadow-sm',
                      sobreOscuro
                        ? 'border-white/25 bg-white/10 hover:border-white/40'
                        : 'border-ink-200/80 bg-white/70 hover:border-ink-300',
                    )}
                  >
                    <Menu className={cn('size-4', sobreOscuro ? 'text-white/80' : 'text-ink-500')} />
                    <Avatar
                      src={user?.avatarUrl}
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      size="sm"
                    />
                  </motion.span>
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
                    {isHost ? (
                      <Link href="/host" onClick={close}>
                        <DropdownItem>
                          <BadgeCheck className="size-4" /> Panel de anfitrión
                        </DropdownItem>
                      </Link>
                    ) : (
                      <Link href="/conviertete-en-anfitrion" onClick={close}>
                        <DropdownItem>
                          <BadgeCheck className="size-4" /> Conviértete en anfitrión
                        </DropdownItem>
                      </Link>
                    )}

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
                <motion.span whileHover={reduceMotion ? undefined : { scale: 1.04 }} whileTap={reduceMotion ? undefined : { scale: 0.96 }} transition={springSnappy} className="hidden sm:inline-flex">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-full',
                      sobreOscuro
                        ? 'text-white/80 hover:bg-white/10 hover:text-white'
                        : 'text-ink-600 hover:bg-ink-900/[0.05] hover:text-ink-900',
                    )}
                  >
                    <Link href="/login">Iniciar sesión</Link>
                  </Button>
                </motion.span>

                <motion.span whileHover={reduceMotion ? undefined : { scale: 1.04 }} whileTap={reduceMotion ? undefined : { scale: 0.96 }} transition={springSnappy}>
                  <Button asChild size="sm" className="rounded-full shadow-[0_6px_18px_-6px_rgba(185,74,41,0.6)]">
                    <Link href="/registro">Registrarse</Link>
                  </Button>
                </motion.span>
              </>
            )}

            <motion.button
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileOpen}
              className={cn(
                'grid size-10 place-items-center rounded-full transition lg:hidden',
                sobreOscuro
                  ? 'text-white hover:bg-white/10'
                  : 'text-ink-700 hover:bg-ink-900/[0.06]',
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'close' : 'open'}
                  initial={reduceMotion ? false : { rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { rotate: 90, opacity: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                  className="grid place-items-center"
                >
                  {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>

        {/* Menú móvil */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
              transition={reduceMotion ? { duration: 0.15 } : { ...springSoft, opacity: { duration: 0.2 } }}
              className="pointer-events-auto mt-2 overflow-hidden rounded-3xl bg-white/92 shadow-xl ring-1 ring-inset ring-white/60 backdrop-blur-xl lg:hidden"
            >
              <ul className="flex flex-col p-2">
                {NAV_LINKS.map((link, i) => {
                  const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

                  return (
                    <motion.li
                      key={link.href}
                      initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={reduceMotion ? { duration: 0 } : { ...springSoft, delay: 0.04 + i * 0.045 }}
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'block rounded-2xl px-4 py-3 text-sm transition',
                          active
                            ? 'bg-ink-100 font-medium text-ink-900'
                            : 'text-ink-700 hover:bg-ink-100',
                        )}
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="border-t border-ink-100 p-3">
                {isAuthenticated ? (
                  <div className="grid gap-1">
                    <Link
                      href="/mis-reservas"
                      className="rounded-2xl px-4 py-3 text-sm text-ink-700 transition hover:bg-ink-100"
                    >
                      Mis reservas
                    </Link>
                    <Link
                      href="/favoritos"
                      className="rounded-2xl px-4 py-3 text-sm text-ink-700 transition hover:bg-ink-100"
                    >
                      Favoritos
                    </Link>
                    <Link
                      href={isHost ? '/host' : '/conviertete-en-anfitrion'}
                      className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-900 transition hover:bg-ink-100"
                    >
                      {isHost ? 'Panel de anfitrión' : 'Conviértete en anfitrión'}
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href="/conviertete-en-anfitrion"
                      className="rounded-2xl px-4 py-3 text-center text-sm font-medium text-ink-900 transition hover:bg-ink-100"
                    >
                      Conviértete en anfitrión
                    </Link>
                    <Button asChild variant="outline" fullWidth className="rounded-2xl">
                      <Link href="/login">Iniciar sesión</Link>
                    </Button>
                    <Button asChild fullWidth className="rounded-2xl">
                      <Link href="/registro">Crear cuenta</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}