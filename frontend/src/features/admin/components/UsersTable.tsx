'use client';

import {
  Avatar,
  Badge,
  ConfirmDialog,
  EmptyState,
  Input,
  Pagination,
  Select,
  Spinner,
} from '@/components/ui';
import { ROLE_LABEL } from '@/constants';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, UserX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { adminService } from '../services/admin.service';

export function UsersTable() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search, role }],
    queryFn: () => adminService.users({ page, limit: 12, search: search || undefined, role: role || undefined }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });
  const onError = (error: Error) => toast.error(error.message);

  const changeRole = useMutation({
    mutationFn: ({ id, nextRole }: { id: string; nextRole: string }) => adminService.updateUserRole(id, nextRole),
    onSuccess: () => {
      toast.success('Rol actualizado');
      void invalidate();
    },
    onError,
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? adminService.activateUser(id) : adminService.deactivateUser(id),
    onSuccess: () => {
      toast.success('Usuario actualizado');
      void invalidate();
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminService.removeUser(id),
    onSuccess: () => {
      toast.success('Usuario eliminado');
      setToDelete(null);
      void invalidate();
    },
    onError,
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Usuarios</h1>
        <p className="mt-1 text-sm text-ink-600">{data?.meta.total ?? 0} cuentas registradas</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-56 flex-1">
          <Input
            placeholder="Buscar por nombre o correo…"
            icon={<Search className="size-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-48">
          <option value="">Todos los roles</option>
          {Object.entries(ROLE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Spinner label="Cargando usuarios…" />
      ) : !data?.data.length ? (
        <EmptyState icon={<UserX className="size-6" />} title="Sin usuarios" description="No hay cuentas con estos filtros." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Usuario</th>
                  <th className="px-5 py-3 font-medium">Teléfono</th>
                  <th className="px-5 py-3 font-medium">Registro</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {data.data.map((user) => {
                  const isSelf = user.id === currentUser?.id;

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-ink-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="sm" />
                          <div>
                            <p className="font-medium text-ink-900">
                              {user.firstName} {user.lastName}
                              {isSelf && <span className="ml-1.5 text-xs text-ink-400">(tú)</span>}
                            </p>
                            <p className="text-xs text-ink-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-600">{user.phone ?? '—'}</td>
                      <td className="px-5 py-3 text-ink-600">{user.createdAt ? formatDate(user.createdAt) : '—'}</td>
                      <td className="px-5 py-3">
                        <Select
                          aria-label="Rol"
                          className="h-9 w-36 rounded-[10px] text-xs"
                          value={user.role}
                          disabled={isSelf}
                          onChange={(e) => changeRole.mutate({ id: user.id, nextRole: e.target.value })}
                        >
                          {Object.entries(ROLE_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          disabled={isSelf}
                          onClick={() => toggleActive.mutate({ id: user.id, active: !user.isActive })}
                          className="disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Badge tone={user.isActive ? 'success' : 'neutral'}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          disabled={isSelf}
                          onClick={() => setToDelete({ id: user.id, name: `${user.firstName} ${user.lastName}` })}
                          aria-label="Eliminar usuario"
                          className="grid size-9 place-items-center rounded-full text-danger-700 transition hover:bg-danger-50 disabled:opacity-30"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar usuario?"
        description={`Se desactivará la cuenta de ${toDelete?.name}. Su historial de reservas se conserva.`}
        confirmLabel="Eliminar"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}
