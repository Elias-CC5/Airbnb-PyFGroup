'use client';

import { SITE } from '@/constants';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { useEffect, useState } from 'react';

/** Botón flotante de soporte. Aparece tras un pequeño scroll para no molestar en el hero. */
export function WhatsappFloating() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const url = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    'Hola, necesito ayuda con una reserva en Airbnb PyFGroup.',
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={`fixed bottom-5 right-5 z-40 grid size-13 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-105 md:bottom-8 md:right-8 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <WhatsappIcon className="size-6" />
    </a>
  );
}