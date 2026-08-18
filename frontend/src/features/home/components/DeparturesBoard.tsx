'use client';

import { TextFlippingBoard } from '@/components/ui/text-flipping-board';
import { useCallback, useEffect, useState } from 'react';

/**
 * Panel split-flap de aeropuerto. El alfabeto del componente no incluye
 * tildes ni Ñ: los mensajes van sin acentos a propósito, si no salen en blanco.
 * Máximo 22 caracteres por línea y 6 líneas.
 */
const MESSAGES: string[] = [
  'BIENVENIDO A PERU\nTU PROXIMA ESTADIA\nEMPIEZA AQUI',
  'LIMA - CUSCO\nAREQUIPA - PUNO\nIQUITOS - PIURA',
  'RESERVA DIRECTO\nCON EL ANFITRION\nSIN INTERMEDIARIOS',
  'CHECK-IN 15:00\nCHECK-OUT 11:00\nBUEN VIAJE!',
  'PYFGROUP\nALOJAMIENTOS\nEN TODO EL PERU',
];

const ROTATION_MS = 6000;

export function DeparturesBoard() {
  const [index, setIndex] = useState(0);
  const next = useCallback(() => setIndex((i) => (i + 1) % MESSAGES.length), []);

  useEffect(() => {
    const id = setInterval(next, ROTATION_MS);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="container-page py-20">
      <header className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-ink-400">Salidas</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
          Tu próximo destino, en pantalla
        </h2>
      </header>

      <TextFlippingBoard text={MESSAGES[index]} />
    </div>
  );
}
