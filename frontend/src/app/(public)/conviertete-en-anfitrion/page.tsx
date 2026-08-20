import { BecomeHost } from '@/features/hosts/components/BecomeHost';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Conviértete en anfitrión',
  description:
    'Publica tu departamento, casa o cabaña en PyFGroup. Tú pones el precio, las fechas y las reglas.',
  path: '/conviertete-en-anfitrion',
});

export default function ConviertetEnAnfitrionPage() {
  return <BecomeHost />;
}
