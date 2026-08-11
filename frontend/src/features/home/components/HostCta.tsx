import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function HostCta() {
  return (
    <section className="container-page mt-24">
      <div className="relative overflow-hidden rounded-[28px] bg-ink-900">
        <Image
          src="https://picsum.photos/seed/wasi-host-cta/1600/700"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-[1.3fr_auto] lg:items-center lg:p-16">
          <div>
            <h2 className="max-w-xl text-3xl leading-tight text-white sm:text-4xl">
              <span className="text-display">¿Tienes un espacio</span>{' '}
              <span className="font-semibold">que quieres alquilar?</span>
            </h2>
            <p className="mt-3 max-w-md text-white/80">
              Publica tu alojamiento, define tus precios y recibe reservas de huéspedes verificados en todo el
              Perú.
            </p>
          </div>
          <Button asChild size="lg" className="justify-self-start bg-white text-ink-900 hover:bg-ink-100">
            <Link href="/contacto">
              Quiero ser anfitrión <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
