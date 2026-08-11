import { NAV_LINKS, SITE } from '@/constants';
import { Facebook, Instagram, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const SOCIALS = [
  { href: `https://wa.me/${SITE.whatsapp}`, label: 'WhatsApp', icon: MessageCircle, external: true },
  { href: 'https://instagram.com', label: 'Instagram', icon: Instagram, external: true },
  { href: 'https://facebook.com', label: 'Facebook', icon: Facebook, external: true },
  { href: `mailto:${SITE.email}`, label: 'Correo', icon: Mail, external: true },
];

/** Monograma sobre placa oscura/arcilla, superpuesto al wordmark de fondo. */
function LogoTile() {
  return (
    <span className="grid size-[72px] place-items-center rounded-[20px] bg-ink-950 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] ring-1 ring-black/10">
      <svg width="38" height="38" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M4 24.5 8.2 8h3.4l3 11.2L17.6 8h3.4L24.2 19.2 27.2 8h3.4L26.4 24.5h-3.5l-2.6-9.6-2.9 9.6h-3.3l-2.7-9.6-2.5 9.6H4Z"
          fill="#ffffff"
        />
      </svg>
    </span>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-white text-ink-900 border-t border-ink-200">
      {/* Halo muy sutil y limpio para la versión clara. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(185,74,41,0.06),transparent_70%)]"
      />

      {/* --- Bloque central --- */}
      <div className="container-page relative pt-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-ink-950">{SITE.name}</h2>

        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-ink-600">
          {SITE.description}
        </p>

        {/* Redes */}
        <ul className="mt-6 flex items-center justify-center gap-5">
          {SOCIALS.map((social) => (
            <li key={social.label}>
              <Link
                href={social.href}
                target={social.external ? '_blank' : undefined}
                rel={social.external ? 'noopener noreferrer' : undefined}
                aria-label={social.label}
                className="inline-grid size-9 place-items-center rounded-full text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-950"
              >
                <social.icon className="size-[18px]" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Enlaces */}
        <nav aria-label="Enlaces del pie" className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-950"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* --- Wordmark gigante recortado + placa del logo --- */}
      <div className="relative mt-14 flex items-end justify-center">
        <span
          aria-hidden
          className="translate-y-[18%] select-none whitespace-nowrap text-[19vw] font-black leading-[0.8] tracking-tighter text-ink-950/[0.04]"
        >
          WASIPERÚ
        </span>

        <span className="absolute bottom-0 translate-y-[35%]">
          <LogoTile />
        </span>
      </div>

      {/* --- Barra inferior --- */}
      <div className="container-page relative flex flex-col items-center justify-between gap-2 pb-6 pt-16 text-xs text-ink-500 sm:flex-row border-t border-ink-100">
        <p>
          © {year} {SITE.name}. Todos los derechos reservados.
        </p>
        <p>Hecho en Perú · Precios en soles (PEN)</p>
      </div>
    </footer>
  );
}