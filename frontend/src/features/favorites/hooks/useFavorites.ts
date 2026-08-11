'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { favoritesService } from '../services/favorites.service';

export function useFavoriteIds() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.favorites.ids,
    queryFn: favoritesService.ids,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useFavoritesList(page = 1) {
  return useQuery({
    queryKey: [...queryKeys.favorites.list, page],
    queryFn: () => favoritesService.list(page),
  });
}

/** Toggle optimista: la UI responde al instante y revierte si el servidor falla. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (propertyId: string) => {
      if (!isAuthenticated) {
        router.push('/login?redirect=/alojamientos');
        throw new Error('Inicia sesión para guardar favoritos');
      }
      return favoritesService.toggle(propertyId);
    },
    onMutate: async (propertyId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.ids });
      const previous = queryClient.getQueryData<string[]>(queryKeys.favorites.ids) ?? [];

      queryClient.setQueryData<string[]>(queryKeys.favorites.ids, (old = []) =>
        old.includes(propertyId) ? old.filter((id) => id !== propertyId) : [...old, propertyId],
      );

      return { previous };
    },
    onError: (error: Error, _id, context) => {
      queryClient.setQueryData(queryKeys.favorites.ids, context?.previous);
      toast.error(error.message);
    },
    onSuccess: (data) => toast.success(data.message),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.ids });
      void queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list });
    },
  });
}
