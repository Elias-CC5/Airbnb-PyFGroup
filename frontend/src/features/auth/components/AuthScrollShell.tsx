'use client';

import { Logo } from '@/components/layout/Logo';
import { MacbookScroll } from '@/components/ui/macbook-scroll';
import { SITE } from '@/constants';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';

interface AuthScrollShellProps {
  headline: ReactNode;
  /** Texto del aviso lateral. */
  hint?: string;
  children: ReactNode;
}

export function AuthScrollShell({
  headline,
  hint = 'Desliza hacia abajo para registrarte',
  children,
}: AuthScrollShellProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative bg-white">
      <header className="absolute inset-x-0 top-0 z-30 px-6 py-6">
        <Link href="/" aria-label={`${SITE.name} — Inicio`} className="inline-flex">
          <Logo />
        </Link>
      </header>

      {/* Aviso lateral: vertical, desaparece en cuanto el usuario empieza a bajar. */}
      <aside
        aria-hidden
        className={`pointer-events-none fixed right-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 transition-opacity duration-500 lg:flex ${
          scrolled ? 'opacity-0' : 'opacity-200'
        }`}
      >
        <span className="text-[18px] font-semibold uppercase tracking-[0.28em] text-ink-400 [writing-mode:vertical-rl]">
          {hint}
        </span>
        <ChevronDown className="size-4 animate-bounce text-ink-400" />
      </aside>

      <div className="w-full overflow-hidden">
        <MacbookScroll title={headline}>{children}</MacbookScroll>
      </div>

      <p className="pb-10 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} {SITE.name}
      </p>
    </div>
  );
}