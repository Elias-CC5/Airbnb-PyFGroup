import { MyReservationsView } from '@/features/reservations/components/MyReservationsView';

export const metadata = { title: 'Mis reservas', robots: { index: false } };

export default function MyReservationsPage() {
  return <MyReservationsView />;
}
