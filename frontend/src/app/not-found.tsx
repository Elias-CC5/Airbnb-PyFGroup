import { Button } from '@/components/ui';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-page flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <p className="text-display text-7xl text-clay-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink-900">No encontramos esta página</h1>
      <p className="mt-2 max-w-sm text-ink-600">
        Puede que el enlace haya cambiado o que el alojamiento ya no esté publicado.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/alojamientos">Ver alojamientos</Link>
        </Button>
      </div>
    </main>
  );
}
