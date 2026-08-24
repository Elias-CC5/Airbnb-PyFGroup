'use client';

import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  Switch,
  Textarea,
} from '@/components/ui';
import {
  BED_TYPE_LABEL,
  CANCELLATION_POLICY_DETAIL,
  CANCELLATION_POLICY_LABEL,
  PROPERTY_STATUS_LABEL,
} from '@/constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  useAmenitiesGrouped,
  useCategories,
  useDepartments,
  useDistricts,
  useProvinces,
} from '@/features/properties/hooks/useCatalog';
import { propertiesService } from '@/features/properties/services/properties.service';
import { cn } from '@/lib/utils';
import type { PropertyDetail } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { propertyFormSchema, type PropertyFormInput } from '../schemas/property.schema';
import { uploadsService } from '../services/uploads.service';
import { PendingImagesPicker, type PendingImage } from './PendingImagesPicker';
import { PropertyImagesManager } from './PropertyImagesManager';

interface PropertyFormProps {
  property?: PropertyDetail;
  /**
   * Dónde vuelve al cancelar y a dónde va tras crear. El panel de admin y el
   * de anfitrión usan el mismo formulario pero viven en rutas distintas.
   */
  basePath?: string;
}

/** Interruptores de reglas; se renderizan en bucle para no repetir markup. */
const HOUSE_RULE_TOGGLES = [
  { name: 'petsAllowed', label: 'Mascotas', hint: 'Se admiten animales' },
  { name: 'smokingAllowed', label: 'Fumar', hint: 'Permitido dentro' },
  { name: 'partiesAllowed', label: 'Fiestas', hint: 'Eventos y reuniones' },
  { name: 'suitableForChildren', label: 'Apto para niños', hint: 'Espacio seguro' },
] as const;

/**
 * Sección numerada del formulario.
 *
 * El número no es decoración: un formulario de esta longitud se lee como una
 * lista de tareas, y saber cuántas quedan cambia la sensación de estar
 * rellenándolo. La descripción evita el problema clásico de los formularios
 * largos —campos que el usuario no sabe si le tocan— sin recurrir a tooltips.
 */
function Seccion({
  numero,
  titulo,
  descripcion,
  children,
}: {
  numero: number;
  titulo: string;
  descripcion: string;
  children: ReactNode;
}) {
  return (
    <Card className="scroll-mt-24">
      <div className="flex gap-4 border-b border-ink-100 p-5 sm:p-6">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-ink-100 text-xs font-semibold tabular-nums text-ink-600">
          {String(numero).padStart(2, '0')}
        </span>
        <div>
          <h2 className="text-base font-semibold text-ink-900">{titulo}</h2>
          <p className="mt-0.5 text-sm text-ink-500">{descripcion}</p>
        </div>
      </div>
      <CardContent className="pt-5 sm:pt-6">{children}</CardContent>
    </Card>
  );
}

/** Texto de ayuda bajo un campo. */
function Ayuda({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{children}</p>;
}

/**
 * Formulario dividido en secciones. En creación guarda primero el alojamiento
 * y luego habilita la subida de imágenes (necesita el ID).
 */
export function PropertyForm({ property, basePath = '/admin/alojamientos' }: PropertyFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  // Imágenes elegidas antes de que el alojamiento exista en el servidor.
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const { data: categories } = useCategories();
  const { data: departments } = useDepartments();
  const { data: amenityGroups } = useAmenitiesGrouped();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PropertyFormInput>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: property
      ? {
          title: property.title,
          shortDescription: property.shortDescription ?? '',
          description: property.description,
          pricePerNight: Number(property.pricePerNight),
          cleaningFee: Number(property.cleaningFee),
          maxGuests: property.maxGuests,
          bedrooms: property.bedrooms,
          beds: property.beds,
          bathrooms: property.bathrooms,
          minNights: property.minNights,
          categoryId: property.category.id,
          status: property.status,
          isFeatured: property.isFeatured,
          whatsappPhone: property.whatsappPhone ?? '',
          checkInTime: property.checkInTime,
          checkOutTime: property.checkOutTime,
          amenityIds: property.amenities.map((a) => a.amenity.id),

          petsAllowed: property.petsAllowed,
          smokingAllowed: property.smokingAllowed,
          partiesAllowed: property.partiesAllowed,
          suitableForChildren: property.suitableForChildren,
          quietHoursFrom: property.quietHoursFrom ?? '',
          quietHoursTo: property.quietHoursTo ?? '',
          houseRules: property.houseRules ?? '',

          areaM2: property.areaM2 ?? undefined,
          floor: property.floor ?? undefined,
          hasElevator: property.hasElevator,
          bedType: property.bedType ?? '',
          viewType: property.viewType ?? '',

          cancellationPolicy: property.cancellationPolicy,
          securityDeposit: Number(property.securityDeposit),
          extraGuestFee: Number(property.extraGuestFee),
          weeklyDiscount: property.weeklyDiscount,
          monthlyDiscount: property.monthlyDiscount,

          location: {
            departmentId: property.location.department.id,
            provinceId: property.location.province.id,
            districtId: property.location.district?.id,
            address: property.location.address ?? '',
            reference: property.location.reference ?? '',
            latitude: property.location.latitude ?? undefined,
            longitude: property.location.longitude ?? undefined,
          },
        }
      : {
          status: 'DRAFT',
          minNights: 1,
          beds: 1,
          cleaningFee: 0,
          checkInTime: '15:00',
          checkOutTime: '11:00',
          amenityIds: [],
          petsAllowed: false,
          smokingAllowed: false,
          partiesAllowed: false,
          suitableForChildren: true,
          hasElevator: false,
          cancellationPolicy: 'MODERATE',
          securityDeposit: 0,
          extraGuestFee: 0,
          weeklyDiscount: 0,
          monthlyDiscount: 0,
          location: {},
        },
  });

  const departmentId = watch('location.departmentId');
  const provinceId = watch('location.provinceId');
  const { data: provinces } = useProvinces(departmentId ? Number(departmentId) : undefined);
  const { data: districts } = useDistricts(provinceId ? Number(provinceId) : undefined);

  const amenidadesElegidas = watch('amenityIds')?.length ?? 0;
  const titulo = watch('title');
  const precio = watch('pricePerNight');

  const save = useMutation({
    mutationFn: async (values: PropertyFormInput) => {
      const payload = {
        ...values,
        shortDescription: values.shortDescription || undefined,
        whatsappPhone: values.whatsappPhone || undefined,
        // Los campos opcionales de texto llegan como '' y el backend espera undefined.
        quietHoursFrom: values.quietHoursFrom || undefined,
        quietHoursTo: values.quietHoursTo || undefined,
        houseRules: values.houseRules || undefined,
        bedType: values.bedType || undefined,
        viewType: values.viewType || undefined,
        location: {
          ...values.location,
          districtId: values.location.districtId ? Number(values.location.districtId) : undefined,
          address: values.location.address || undefined,
          reference: values.location.reference || undefined,
        },
      };

      if (property) return propertiesService.update(property.id, payload);

      const created = await propertiesService.create(payload);

      // El endpoint de imágenes necesita el ID, así que las subimos recién creado.
      if (pendingImages.length > 0) {
        try {
          const uploaded = await uploadsService.uploadPropertyImages(
            created.id,
            pendingImages.map((image) => image.file),
          );

          const mainIndex = pendingImages.findIndex((image) => image.isMain);
          if (mainIndex > 0 && uploaded.length === pendingImages.length) {
            await uploadsService.setMain(uploaded[mainIndex].id);
          }
        } catch {
          toast.error(
            'El alojamiento se creó, pero falló la subida de imágenes. Inténtalo de nuevo desde su ficha.',
          );
        }
      }

      return created;
    },
    onSuccess: (saved) => {
      toast.success(property ? 'Alojamiento actualizado' : 'Alojamiento creado');
      void queryClient.invalidateQueries({ queryKey: ['properties'] });
      if (!property) router.replace(`${basePath}/${saved.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const hayCambios = isDirty || pendingImages.length > 0;

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="pb-10" noValidate>
      {/*
        La cabecera se queda pegada arriba: en un formulario tan largo, tener
        que subir hasta el principio para guardar es la queja número uno.
      */}
      <header className="sticky top-0 z-20 -mx-4 mb-6 border-b border-ink-200 bg-white/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
              {property ? property.title : titulo || 'Nuevo alojamiento'}
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              {property
                ? 'Los cambios se aplican al guardar.'
                : 'Ocho pasos. Puedes guardarlo como borrador y seguir después.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hayCambios && (
              <span className="hidden text-xs text-ink-500 sm:inline">Sin guardar</span>
            )}
            <Button type="button" variant="outline" onClick={() => router.push(basePath)}>
              Cancelar
            </Button>
            <Button type="submit" loading={save.isPending} disabled={!hayCambios && !!property}>
              Guardar
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Seccion
            numero={1}
            titulo="Información básica"
            descripcion="Lo primero que ve un huésped en los resultados de búsqueda."
          >
            <div className="grid gap-5">
              <div>
                <Label htmlFor="title" required>
                  Título
                </Label>
                <Input
                  id="title"
                  placeholder="Casa moderna con vista al valle"
                  error={errors.title?.message}
                  {...register('title')}
                />
                <Ayuda>
                  Di qué es y qué lo hace distinto. Los títulos concretos reciben más clics que
                  los genéricos.
                </Ayuda>
              </div>

              <div>
                <Label htmlFor="shortDescription">Descripción corta</Label>
                <Input
                  id="shortDescription"
                  placeholder="3 habitaciones · 6 huéspedes · Cusco"
                  error={errors.shortDescription?.message}
                  {...register('shortDescription')}
                />
                <Ayuda>Una línea que acompaña al título en la tarjeta.</Ayuda>
              </div>

              <div>
                <Label htmlFor="description" required>
                  Descripción completa
                </Label>
                <Textarea
                  id="description"
                  rows={7}
                  placeholder="Describe los ambientes, la zona y lo que hace especial al alojamiento…"
                  error={errors.description?.message}
                  {...register('description')}
                />
                <Ayuda>
                  Cuenta los ambientes, cómo es el barrio y qué hay cerca. Lo que no expliques
                  aquí te lo van a preguntar por WhatsApp.
                </Ayuda>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="categoryId" required>
                    Tipo de alojamiento
                  </Label>
                  <Select
                    id="categoryId"
                    error={errors.categoryId?.message}
                    {...register('categoryId')}
                  >
                    <option value="">Selecciona…</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="whatsappPhone">WhatsApp del anfitrión</Label>
                  <Input
                    id="whatsappPhone"
                    placeholder="+51 974 467 762"
                    {...register('whatsappPhone')}
                  />
                  <Ayuda>Por aquí te escriben los huéspedes para coordinar la llegada.</Ayuda>
                </div>
              </div>
            </div>
          </Seccion>

          <Seccion
            numero={2}
            titulo="Capacidad"
            descripcion="Cuánta gente entra y con qué comodidad. Filtra las búsquedas."
          >
            <div className="grid gap-5 sm:grid-cols-4">
              <div>
                <Label htmlFor="maxGuests" required>
                  Huéspedes
                </Label>
                <Input
                  id="maxGuests"
                  type="number"
                  min={1}
                  error={errors.maxGuests?.message}
                  {...register('maxGuests')}
                />
              </div>
              <div>
                <Label htmlFor="bedrooms" required>
                  Habitaciones
                </Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min={0}
                  error={errors.bedrooms?.message}
                  {...register('bedrooms')}
                />
              </div>
              <div>
                <Label htmlFor="beds">Camas</Label>
                <Input id="beds" type="number" min={1} {...register('beds')} />
              </div>
              <div>
                <Label htmlFor="bathrooms" required>
                  Baños
                </Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min={1}
                  error={errors.bathrooms?.message}
                  {...register('bathrooms')}
                />
              </div>
            </div>
          </Seccion>

          <Seccion
            numero={3}
            titulo="Precio y estadía"
            descripcion="Todos los montos en soles. El huésped ve el total antes de reservar."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="pricePerNight" required>
                  Precio por noche
                </Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  min={1}
                  placeholder="180"
                  error={errors.pricePerNight?.message}
                  {...register('pricePerNight')}
                />
                <Ayuda>En soles (S/).</Ayuda>
              </div>
              <div>
                <Label htmlFor="cleaningFee">Tarifa de limpieza</Label>
                <Input id="cleaningFee" type="number" min={0} {...register('cleaningFee')} />
                <Ayuda>Se cobra una vez por estadía. Deja 0 si no aplica.</Ayuda>
              </div>
              <div>
                <Label htmlFor="minNights">Noches mínimas</Label>
                <Input id="minNights" type="number" min={1} {...register('minNights')} />
              </div>

              <div>
                <Label htmlFor="checkInTime">Check-in</Label>
                <Input id="checkInTime" placeholder="15:00" {...register('checkInTime')} />
              </div>
              <div>
                <Label htmlFor="checkOutTime">Check-out</Label>
                <Input id="checkOutTime" placeholder="11:00" {...register('checkOutTime')} />
              </div>
            </div>
          </Seccion>

          <Seccion
            numero={4}
            titulo="Ubicación"
            descripcion="La dirección exacta solo la ve el huésped con reserva confirmada."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="departmentId" required>
                  Departamento
                </Label>
                <Select
                  id="departmentId"
                  error={errors.location?.departmentId?.message}
                  {...register('location.departmentId', {
                    onChange: () => {
                      setValue('location.provinceId', 0 as never);
                      setValue('location.districtId', undefined);
                    },
                  })}
                >
                  <option value="">Selecciona…</option>
                  {departments?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="provinceId" required>
                  Provincia
                </Label>
                <Select
                  id="provinceId"
                  disabled={!departmentId}
                  error={errors.location?.provinceId?.message}
                  {...register('location.provinceId', {
                    onChange: () => setValue('location.districtId', undefined),
                  })}
                >
                  <option value="">Selecciona…</option>
                  {provinces?.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="districtId">Distrito</Label>
                <Select id="districtId" disabled={!provinceId} {...register('location.districtId')}>
                  <option value="">Selecciona…</option>
                  {districts?.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="Calle Los Álamos 123"
                  {...register('location.address')}
                />
              </div>
              <div>
                <Label htmlFor="reference">Referencia</Label>
                <Input
                  id="reference"
                  placeholder="A dos cuadras de la plaza"
                  {...register('location.reference')}
                />
              </div>

              <div>
                <Label htmlFor="latitude">Latitud</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="-12.0464"
                  error={errors.location?.latitude?.message}
                  {...register('location.latitude')}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitud</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="-77.0428"
                  error={errors.location?.longitude?.message}
                  {...register('location.longitude')}
                />
              </div>
              <div className="self-end">
                <Ayuda>
                  Opcional, pero pone el pin en el mapa. En Google Maps: clic derecho sobre el
                  punto exacto y copia las coordenadas.
                </Ayuda>
              </div>
            </div>
          </Seccion>

          <Seccion
            numero={5}
            titulo="Detalles del espacio"
            descripcion="Opcional. Aparecen en la ficha y ayudan a decidir."
          >
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="areaM2">Área (m²)</Label>
                <Input id="areaM2" type="number" min={1} placeholder="85" {...register('areaM2')} />
              </div>
              <div>
                <Label htmlFor="floor">Piso</Label>
                <Input id="floor" type="number" min={0} placeholder="4" {...register('floor')} />
              </div>
              <div>
                <Label htmlFor="bedType">Tipo de cama principal</Label>
                <Select id="bedType" {...register('bedType')}>
                  <option value="">Sin especificar</option>
                  {Object.entries(BED_TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="viewType">Vista</Label>
                <Input id="viewType" placeholder="Vista al parque" {...register('viewType')} />
              </div>
              <div className="flex items-center justify-between self-end rounded-xl border border-ink-200 px-4 py-3">
                <p className="text-sm font-medium text-ink-900">Ascensor</p>
                <Controller
                  control={control}
                  name="hasElevator"
                  render={({ field }) => (
                    <Switch
                      checked={field.value ?? false}
                      onChange={field.onChange}
                      label="Ascensor"
                    />
                  )}
                />
              </div>
            </div>
          </Seccion>

          <Seccion
            numero={6}
            titulo="Reglas de la casa"
            descripcion="Dicho de entrada, evita discusiones a mitad de la estadía."
          >
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {HOUSE_RULE_TOGGLES.map((rule) => (
                  <div
                    key={rule.name}
                    className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-900">{rule.label}</p>
                      <p className="text-xs text-ink-500">{rule.hint}</p>
                    </div>
                    <Controller
                      control={control}
                      name={rule.name}
                      render={({ field }) => (
                        <Switch
                          checked={field.value ?? false}
                          onChange={field.onChange}
                          label={rule.label}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="quietHoursFrom">Silencio desde</Label>
                  <Input id="quietHoursFrom" placeholder="22:00" {...register('quietHoursFrom')} />
                </div>
                <div>
                  <Label htmlFor="quietHoursTo">Silencio hasta</Label>
                  <Input id="quietHoursTo" placeholder="08:00" {...register('quietHoursTo')} />
                </div>
              </div>

              <div>
                <Label htmlFor="houseRules">Otras reglas</Label>
                <Textarea
                  id="houseRules"
                  rows={4}
                  placeholder="Prohibido subir muebles a la terraza, no se permite música alta…"
                  {...register('houseRules')}
                />
              </div>
            </div>
          </Seccion>

          <Seccion
            numero={7}
            titulo="Políticas y cobros"
            descripcion="Qué pasa si cancelan y qué se cobra aparte del precio por noche."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="cancellationPolicy">Política de cancelación</Label>
                <Select id="cancellationPolicy" {...register('cancellationPolicy')}>
                  {Object.entries(CANCELLATION_POLICY_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label} — {CANCELLATION_POLICY_DETAIL[value]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="securityDeposit">Depósito de garantía (S/)</Label>
                <Input id="securityDeposit" type="number" min={0} {...register('securityDeposit')} />
              </div>
              <div>
                <Label htmlFor="extraGuestFee">Huésped extra (S/ por noche)</Label>
                <Input id="extraGuestFee" type="number" min={0} {...register('extraGuestFee')} />
              </div>
              <div>
                <Label htmlFor="weeklyDiscount">Descuento semanal (%)</Label>
                <Input
                  id="weeklyDiscount"
                  type="number"
                  min={0}
                  max={90}
                  error={errors.weeklyDiscount?.message}
                  {...register('weeklyDiscount')}
                />
              </div>
              <div>
                <Label htmlFor="monthlyDiscount">Descuento mensual (%)</Label>
                <Input
                  id="monthlyDiscount"
                  type="number"
                  min={0}
                  max={90}
                  error={errors.monthlyDiscount?.message}
                  {...register('monthlyDiscount')}
                />
              </div>
            </div>
          </Seccion>

          <Seccion
            numero={8}
            titulo="Comodidades"
            descripcion={
              amenidadesElegidas > 0
                ? `${amenidadesElegidas} seleccionadas. Son filtros de búsqueda: marca solo las que hay de verdad.`
                : 'Son filtros de búsqueda: marca solo las que hay de verdad.'
            }
          >
            <Controller
              control={control}
              name="amenityIds"
              render={({ field }) => (
                <div className="space-y-5">
                  {amenityGroups?.map((group) => (
                    <div key={group.group}>
                      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                        {group.group}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((amenity) => {
                          const selected = field.value?.includes(amenity.id) ?? false;
                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                field.onChange(
                                  selected
                                    ? (field.value ?? []).filter((id) => id !== amenity.id)
                                    : [...(field.value ?? []), amenity.id],
                                )
                              }
                              className={cn(
                                'rounded-full border px-3.5 py-2 text-sm transition',
                                selected
                                  ? 'border-ink-900 bg-ink-900 text-white'
                                  : 'border-ink-300 text-ink-700 hover:border-ink-500',
                              )}
                            >
                              {amenity.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </Seccion>
        </div>

        {/* Columna lateral: acompaña el scroll en pantallas anchas. */}
        <div className="space-y-5 xl:sticky xl:top-28 xl:self-start">
          <Card>
            <div className="border-b border-ink-100 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink-900">Publicación</h2>
              <p className="mt-0.5 text-sm text-ink-500">
                {isAdmin
                  ? 'Controlas el estado y la portada.'
                  : 'Guárdalo como borrador; un administrador lo revisa antes de publicarlo.'}
              </p>
            </div>
            <CardContent className="space-y-4 pt-5 sm:pt-6">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select id="status" {...register('status')}>
                  {Object.entries(PROPERTY_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>

              {/*
                El destacado es un beneficio de los planes de pago: se enciende
                solo al confirmarse un pago y se apaga al vencer. Si el
                anfitrión pudiera activarlo desde aquí, el plan no valdría nada.
              */}
              {isAdmin && (
                <div className="flex items-center justify-between rounded-xl border border-ink-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">Destacado</p>
                    <p className="text-xs text-ink-500">Aparece en la portada</p>
                  </div>
                  <Controller
                    control={control}
                    name="isFeatured"
                    render={({ field }) => (
                      <Switch
                        checked={field.value ?? false}
                        onChange={field.onChange}
                        label="Destacado"
                      />
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="border-b border-ink-100 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink-900">Fotos</h2>
              <p className="mt-0.5 text-sm text-ink-500">
                La primera es la portada. Horizontales y con luz de día funcionan mejor.
              </p>
            </div>
            <CardContent className="pt-5 sm:pt-6">
              {property ? (
                <PropertyImagesManager propertyId={property.id} images={property.images} />
              ) : (
                <PendingImagesPicker
                  value={pendingImages}
                  onChange={setPendingImages}
                  disabled={save.isPending}
                />
              )}
            </CardContent>
          </Card>

          {/* Resumen de lo imprescindible, para no tener que subir a comprobar. */}
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Para poder guardar
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { hecho: Boolean(titulo?.trim()), texto: 'Título' },
                { hecho: Boolean(watch('description')?.trim()), texto: 'Descripción completa' },
                { hecho: Boolean(watch('categoryId')), texto: 'Tipo de alojamiento' },
                { hecho: Number(precio) > 0, texto: 'Precio por noche' },
                { hecho: Boolean(watch('location.provinceId')), texto: 'Ubicación' },
              ].map((item) => (
                <li key={item.texto} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'size-1.5 shrink-0 rounded-full',
                      item.hecho ? 'bg-ink-900' : 'bg-ink-300',
                    )}
                  />
                  <span className={item.hecho ? 'text-ink-900' : 'text-ink-500'}>{item.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
