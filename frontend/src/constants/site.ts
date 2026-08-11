export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Airbnb PyFGroup',
  tagline: 'Alojamientos con alma peruana',
  description:
    'Encuentra casas, departamentos y cabañas para alquilar en todo el Perú. Reserva en línea, paga en soles y coordina directo con el anfitrión.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  locale: 'es_PE',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? '51999888777',
  email: 'hola@wasi.pe',
} as const;

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/alojamientos', label: 'Alojamientos' },
  { href: '/destinos', label: 'Destinos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
] as const;

export const ACCOUNT_LINKS = [
  { href: '/perfil', label: 'Mi perfil', icon: 'user' },
  { href: '/mis-reservas', label: 'Mis reservas', icon: 'calendar-check' },
  { href: '/favoritos', label: 'Favoritos', icon: 'heart' },
] as const;

export const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: 'layout-dashboard' },
  { href: '/admin/alojamientos', label: 'Alojamientos', icon: 'house' },
  { href: '/admin/reservas', label: 'Reservas', icon: 'calendar-days' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: 'users' },
  { href: '/admin/categorias', label: 'Categorías', icon: 'tags' },
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: 'chart-line' },
] as const;
