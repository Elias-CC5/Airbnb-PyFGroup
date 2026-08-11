'use client';

import {
  Badge,
  Button,
  ConfirmDialog,
  Input,
  Label,
  Modal,
  Spinner,
  Switch,
  Textarea,
} from '@/components/ui';
import { catalogService } from '@/features/properties/services/catalog.service';
import { queryKeys } from '@/services/api';
import type { Category } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Draft {
  id?: number;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
}

const EMPTY: Draft = { name: '', description: '', icon: '', isActive: true };

export function CategoriesManager() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.categories.admin,
    queryFn: catalogService.categoriesAdmin,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories'] });
  const onError = (error: Error) => toast.error(error.message);

  const save = useMutation({
    mutationFn: (values: Draft) => {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        icon: values.icon || undefined,
        isActive: values.isActive,
      };
      return values.id ? catalogService.updateCategory(values.id, payload) : catalogService.createCategory(payload);
    },
    onSuccess: () => {
      toast.success('Categoría guardada');
      setDraft(null);
      void invalidate();
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: number) => catalogService.removeCategory(id),
    onSuccess: () => {
      toast.success('Categoría eliminada');
      setToDelete(null);
      void invalidate();
    },
    onError,
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Categorías</h1>
          <p className="mt-1 text-sm text-ink-600">Tipos de alojamiento disponibles en la plataforma.</p>
        </div>
        <Button onClick={() => setDraft(EMPTY)}>
          <Plus className="size-4" /> Nueva categoría
        </Button>
      </header>

      {isLoading ? (
        <Spinner label="Cargando categorías…" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.map((category) => (
            <article key={category.id} className="rounded-2xl border border-ink-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-ink-900">{category.name}</h2>
                  <p className="mt-0.5 text-xs text-ink-500">/{category.slug}</p>
                </div>
                <Badge tone={category.isActive ? 'success' : 'neutral'}>
                  {category.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>

              {category.description && (
                <p className="mt-3 line-clamp-2 text-sm text-ink-600">{category.description}</p>
              )}

              <p className="mt-3 text-xs text-ink-500">{category._count?.properties ?? 0} alojamientos</p>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setDraft({
                      id: category.id,
                      name: category.name,
                      description: category.description ?? '',
                      icon: category.icon ?? '',
                      isActive: category.isActive ?? true,
                    })
                  }
                >
                  <Pencil className="size-3.5" /> Editar
                </Button>
                <Button size="sm" variant="ghost" className="text-danger-700" onClick={() => setToDelete(category)}>
                  <Trash2 className="size-3.5" /> Eliminar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <CategoryModal draft={draft} onClose={() => setDraft(null)} onSave={(values) => save.mutate(values)} saving={save.isPending} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar categoría?"
        description={`Se eliminará "${toDelete?.name}". Sólo es posible si no tiene alojamientos asociados.`}
        confirmLabel="Eliminar"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}

function CategoryModal({
  draft,
  onClose,
  onSave,
  saving,
}: {
  draft: Draft | null;
  onClose: () => void;
  onSave: (values: Draft) => void;
  saving: boolean;
}) {
  const [values, setValues] = useState<Draft>(EMPTY);

  useEffect(() => {
    if (draft) setValues(draft);
  }, [draft]);

  return (
    <Modal
      open={Boolean(draft)}
      onClose={onClose}
      title={draft?.id ? 'Editar categoría' : 'Nueva categoría'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(values)} loading={saving} disabled={values.name.trim().length < 3}>
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="cat-name" required>Nombre</Label>
          <Input
            id="cat-name"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            placeholder="Casa de playa"
          />
        </div>
        <div>
          <Label htmlFor="cat-desc">Descripción</Label>
          <Textarea
            id="cat-desc"
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            placeholder="Frente al mar del norte y sur"
          />
        </div>
        <div>
          <Label htmlFor="cat-icon">Icono (lucide)</Label>
          <Input
            id="cat-icon"
            value={values.icon}
            onChange={(e) => setValues({ ...values, icon: e.target.value })}
            placeholder="waves"
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3">
          <span className="text-sm text-ink-800">Categoría activa</span>
          <Switch checked={values.isActive} onChange={(v) => setValues({ ...values, isActive: v })} label="Activa" />
        </div>
      </div>
    </Modal>
  );
}
