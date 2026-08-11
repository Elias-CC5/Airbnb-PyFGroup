import { FavoritesView } from '@/features/favorites/components/FavoritesView';

export const metadata = { title: 'Mis favoritos', robots: { index: false } };

export default function FavoritesPage() {
  return <FavoritesView />;
}
