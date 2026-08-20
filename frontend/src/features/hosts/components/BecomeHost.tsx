'use client';

import { Button, Spinner } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock,
  Images,
  MessageCircle,
  Tag,
  TrendingUp,
  UserRound,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { hostService } from '../services/host.service';
import { HostApplicationForm } from './HostApplicationForm';

const BENEFICIOS = [
  { icon: Images, titulo: 'Publica tus alojamientos', texto: 'Fotos, descripción y precio, a tu manera.' },
  { icon: CalendarRange, titulo: 'Administra tus reservas', texto: 'Un calendario con tus fechas ocupadas y libres.' },
  { icon: MessageCircle, titulo: 'Habla con tus huéspedes', texto: 'Coordina la llegada por WhatsApp, sin intermediarios.' },
  { icon: Tag, titulo: 'Pon tus precios', texto: 'Ajusta tarifas por temporada cuando quieras.' },
  { icon: TrendingUp, titulo: 'Controla tus ingresos', texto: 'Lo facturado por mes y por alojamiento.' },
  { icon: UserRound, titulo: 'Tu perfil de anfitrión', texto: 'Los viajeros ven quién eres antes de reservar.' },
];

export function BecomeHost() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const { data, isLoading: cargandoEstado } = useQuery({
    queryKey: queryKeys.hosts.me,
    queryFn: hostService.me,
    enabled: isAuthenticated,
  });

  if (mostrarFormulario) {
    return <HostApplicationForm onCancel={() => setMostrarFormulario(false)} />;
  }

  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
            Anfitriones
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl">
            Comparte tu espacio y empieza a recibir huéspedes.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600">
            Publica tu departamento, casa o cabaña en PyFGroup. Tú decides el precio, las fechas y
            las reglas. Nosotros nos encargamos de que te encuentren.
          </p>
        </motion.div>

        <div className="mt-10">
          <EstadoYAccion
            autenticado={isAuthenticated}
            cargando={isLoading || (isAuthenticated && cargandoEstado)}
            estado={data}
            onComenzar={() => setMostrarFormulario(true)}
          />
        </div>
      </div>

      <ul className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFICIOS.map((b, i) => (
          <motion.li
            key={b.titulo}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <b.icon className="size-5 text-ink-900" />
            <h3 className="mt-3 font-semibold text-ink-900">{b.titulo}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">{b.texto}</p>
          </motion.li>
        ))}
      </ul>

      <div className="mx-auto mt-20 max-w-3xl rounded-2xl border border-ink-200 bg-ink-50 p-6">
        <h2 className="font-semibold text-ink-900">Cómo funciona</h2>
        <ol className="mt-4 space-y-3 text-sm text-ink-700">
          <li>
            <span className="font-medium text-ink-900">1.</span> Nos cuentas quién eres y qué
            piensas publicar.
          </li>
          <li>
            <span className="font-medium text-ink-900">2.</span> Verificamos tu identidad. Suele
            tomar uno o dos días hábiles.
          </li>
          <li>
            <span className="font-medium text-ink-900">3.</span> Te avisamos por correo y creas tu
            primer alojamiento.
          </li>
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-ink-500">
          Pedimos tu documento solo para confirmar que eres quien dices ser. Lo revisa una persona
          del equipo, queda registrado quién lo consultó, y las imágenes se eliminan apenas
          resolvemos tu solicitud.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface EstadoProps {
  autenticado: boolean;
  cargando: boolean;
  estado?: Awaited<ReturnType<typeof hostService.me>>;
  onComenzar: () => void;
}

function EstadoYAccion({ autenticado, cargando, estado, onComenzar }: EstadoProps) {
  if (cargando) return <Spinner />;

  // Sin sesión: al volver del login se regresa aquí mismo.
  if (!autenticado) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild size="lg" className="rounded-full">
          <Link href="/login?redirect=/conviertete-en-anfitrion">
            Comenzar <ArrowRight className="size-4" />
          </Link>
        </Button>
        <p className="text-sm text-ink-500">
          ¿No tienes cuenta?{' '}
          <Link
            href="/registro?redirect=/conviertete-en-anfitrion"
            className="underline underline-offset-4 hover:text-ink-900"
          >
            Créala en un minuto
          </Link>
        </p>
      </div>
    );
  }

  if (estado?.isHost) {
    return (
      <Aviso
        icono={<CheckCircle2 className="size-5 text-success-700" />}
        titulo="Ya eres anfitrión"
        texto="Tu cuenta está aprobada. Puedes publicar alojamientos cuando quieras."
      />
    );
  }

  const solicitud = estado?.application;

  if (solicitud?.status === 'SUBMITTED' || solicitud?.status === 'UNDER_REVIEW') {
    return (
      <Aviso
        icono={<Clock className="size-5 text-ink-500" />}
        titulo="Tu solicitud está en revisión"
        texto="Te escribiremos al correo en cuanto la revisemos. Normalmente tarda uno o dos días hábiles."
      />
    );
  }

  if (solicitud?.status === 'REJECTED') {
    return (
      <div className="space-y-4">
        <Aviso
          icono={<XCircle className="size-5 text-danger-700" />}
          titulo="No pudimos aprobar tu solicitud"
          texto={solicitud.rejectionReason ?? 'No se indicó un motivo.'}
          tono="danger"
        />
        <Button size="lg" className="rounded-full" onClick={onComenzar}>
          Corregir y volver a enviar <ArrowRight className="size-4" />
        </Button>
      </div>
    );
  }

  if (estado?.status === 'SUSPENDED') {
    return (
      <Aviso
        icono={<XCircle className="size-5 text-danger-700" />}
        titulo="Tu cuenta de anfitrión está suspendida"
        texto="Escríbenos para revisar tu caso."
        tono="danger"
      />
    );
  }

  return (
    <Button size="lg" className="rounded-full" onClick={onComenzar}>
      Comenzar <ArrowRight className="size-4" />
    </Button>
  );
}

function Aviso({
  icono,
  titulo,
  texto,
  tono = 'neutral',
}: {
  icono: React.ReactNode;
  titulo: string;
  texto: string;
  tono?: 'neutral' | 'danger';
}) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border p-5 ${
        tono === 'danger' ? 'border-danger-500/20 bg-danger-50' : 'border-ink-200 bg-white'
      }`}
    >
      <span className="mt-0.5 shrink-0">{icono}</span>
      <div>
        <p className="font-semibold text-ink-900">{titulo}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-600">{texto}</p>
      </div>
    </div>
  );
}
