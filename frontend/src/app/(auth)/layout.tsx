import { Logo } from '@/components/layout/Logo';
import Image from 'next/image';
import Link from 'next/link';

/** Split screen: formulario a la izquierda, imagen editorial a la derecha. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" className="mb-auto">
          <Logo />
        </Link>

        <main id="contenido" className="mx-auto w-full max-w-md py-10">
          {children}
        </main>

        <p className="mt-auto text-center text-xs text-ink-400">
          © {new Date().getFullYear()} Airbnb PyFGroup

        </p>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src="https://picsum.photos/seed/wasi-auth/1200/1600"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-ink-950/10" />
        <blockquote className="absolute inset-x-0 bottom-0 p-12">
          <p className="text-display max-w-md text-3xl leading-tight text-white">
            “Viajar por el Perú se siente distinto cuando te reciben como en casa.”
          </p>
        </blockquote>
      </div>
    </div>
  );
}
