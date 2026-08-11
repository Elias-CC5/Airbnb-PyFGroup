import { Parallax } from '@/components/ui/Parallax';
import { Star } from 'lucide-react';
import Image from 'next/image';

/** Paisaje de fondo. Sustitúyelo por '/hero/fondo.jpg' cuando subas el tuyo. */
const BACKGROUND_IMAGE = 'https://picsum.photos/seed/wasi-hero-peru/1920/1080';


const FOREGROUND_IMAGE: string | null = null;

export function Hero() {
  return (
    <section className="relative">
      <div className="container-page pt-4">
        <div className="relative overflow-hidden rounded-[28px]">
          <div className="relative h-[440px] w-full sm:h-[560px]">
            {/* --- Capa 1: paisaje, se mueve despacio --- */}
            <Parallax speed={0.22} className="absolute inset-0 scale-[1.2]">
              <div className="relative size-full">
                <Image
                  src={BACKGROUND_IMAGE}
                  alt="Paisaje andino del Perú"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </Parallax>

            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/25 to-ink-950/5" />

            {/* --- Capa 2: titular --- */}
            <Parallax speed={-0.05} className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10 lg:p-14">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <Star className="size-3.5 fill-white" />
                Más de 1.200 huéspedes hospedados este año
              </span>

              <h1 className="mt-4 max-w-2xl text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                <span className="text-display block">Donde quieras ir</span>
                <span className="block font-semibold tracking-tight">en el Perú, hay un wasi.</span>
              </h1>

              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85">
                Casas, departamentos y cabañas seleccionadas una por una. Reserva en línea, paga en
                soles y coordina directo con el anfitrión.
              </p>
            </Parallax>

            {/* --- Capa 3: figura recortada, delante del texto --- */}
            {FOREGROUND_IMAGE && (
              <Parallax
                speed={-0.16}
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center"
              >
                <div className="relative h-[380px] w-[280px] sm:h-[480px] sm:w-[340px]">
                  <Image
                    src={FOREGROUND_IMAGE}
                    alt=""
                    fill
                    priority
                    sizes="340px"
                    className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </Parallax>
            )}
          </div>
        </div>
      </div>

      <div className="container-page relative z-30 -mt-8 sm:-mt-9">
        <div className="mx-auto max-w-4xl">
        </div>
      </div>
    </section>
  );
}