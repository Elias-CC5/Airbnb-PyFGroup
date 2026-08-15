import { FOOTER_LEGAL_LINKS, NAV_LINKS, SITE } from '@/constants';
import { TikTokIcon } from '@/components/icons/TikTokIcon';
import { WhatsappIcon } from '@/features/whatsapp/components/icons/WhatsappIcon';
import { Facebook, Instagram, Mail } from 'lucide-react';
import Link from 'next/link';

/** Texto del wordmark de fondo. Si lo cambias, ajusta el fontSize del <text>. */
const WORDMARK = 'PyFGroup';

const SOCIALS = [
  { href: `https://wa.me/${SITE.whatsapp}`, label: 'WhatsApp', icon: WhatsappIcon },
  { href: 'https://www.instagram.com/pyfgroupsac/', label: 'Instagram', icon: Instagram },
  { href: 'https://www.facebook.com/people/PYF-GROUP-SAC/61584334442465/', label: 'Facebook', icon: Facebook },
  { href: 'https://www.tiktok.com/@pyf.group.sac', label: 'TikTok', icon: TikTokIcon },
  { href: `mailto:${SITE.email}`, label: 'Correo', icon: Mail },
];

/** Monograma sobre placa oscura, superpuesto al wordmark de fondo. */
function LogoTile() {
  return (
    <span className="grid size-[72px] place-items-center rounded-[20px] bg-ink-950 shadow-[0_20px_50px_-14px_rgba(28,25,23,0.5)]">
      <svg width="38" height="38" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path
          d="M4 24.5 8.2 8h3.4l3 11.2L17.6 8h3.4L24.2 19.2 27.2 8h3.4L26.4 24.5h-3.5l-2.6-9.6-2.9 9.6h-3.3l-2.7-9.6-2.5 9.6H4Z"
          fill="white"
        />
      </svg>
    </span>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-gradient-to-b from-white to-ink-50">
      {/* Bloque central */}
      <div className="container-page relative pt-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{SITE.name}</h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">
          {SITE.description}
        </p>

        {/* Redes */}
        <ul className="mt-6 flex items-center justify-center gap-5">
          {SOCIALS.map((social) => (
            <li key={social.label}>
              <Link
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="inline-grid size-9 place-items-center rounded-full text-ink-500 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900"
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
                  className="text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Wordmark gigante recortado + placa del logo centrada correctamente */}
      <div className="relative mt-14 flex justify-center overflow-hidden pb-8">
        {/* Sin textLength: las letras conservan su proporción y el SVG escala
            el conjunto. Estirarlas al ancho exacto las deformaba. */}
        <svg
          aria-hidden
          viewBox="0 0 1000 200"
          preserveAspectRatio="xMidYMax meet"
          className="w-full select-none"
        >
          <text
            x="500"
            y="155"
            textAnchor="middle"
            className="fill-ink-950/[0.055] font-black"
            style={{ fontSize: 165, letterSpacing: '-0.04em' }}
          >
            {WORDMARK}
          </text>
        </svg>

        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <LogoTile />
        </div>
      </div>

      {/* Barra inferior */}
      <div className="container-page relative border-t border-ink-100 pb-6 pt-6 text-xs text-ink-500">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>
            © {year} {SITE.name}. Todos los derechos reservados.
          </p>
          <p>Hecho en Perú · Precios en soles (PEN)</p>
        </div>

        {/* Enlaces legales */}
        <nav aria-label="Enlaces legales" className="mt-4 flex justify-center border-t border-ink-100 pt-4 sm:justify-start">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs text-ink-400 transition-colors duration-200 hover:text-ink-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}