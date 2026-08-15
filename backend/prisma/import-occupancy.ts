/* eslint-disable no-console */
/**
 * Importa la ocupación de un mes exportada desde la hoja de cálculo.
 *
 *     npm run import:ocupacion            # importa prisma/data/ocupacion-2026-08.json
 *     npm run import:ocupacion -- 2026-09 # otro mes, si existe el JSON
 *
 * Es idempotente: cada reserva lleva un código determinista (IMP-<dpto>-<fecha>),
 * así que volver a ejecutarlo actualiza en vez de duplicar.
 *
 * NO borra nada: las reservas creadas en la web no se tocan.
 */
import { BookingChannel, PrismaClient, PropertyStatus, ReservationStatus, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface ImportedReservation {
  dpto: string;
  guest: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  channel: string;
  paymentCode: number | null;
}

const slugify = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** El "Es" de la hoja: 1 pagado, 2 sin pago, 3 pendiente Airbnb, 4 reservado. */
const statusFromPaymentCode = (code: number | null): ReservationStatus => {
  if (code === 1) return ReservationStatus.COMPLETED;
  if (code === 2 || code === 3) return ReservationStatus.PENDING;
  return ReservationStatus.CONFIRMED;
};

async function main() {
  const month = process.argv[2] ?? '2026-08';
  const file = join(__dirname, 'data', `ocupacion-${month}.json`);

  const payload = JSON.parse(readFileSync(file, 'utf-8')) as {
    month: string;
    reservations: ImportedReservation[];
  };
  console.log(`Importando ${payload.reservations.length} reservas de ${payload.month}`);

  // ---------------------- prerequisitos compartidos ----------------------
  const owner = await prisma.user.findFirst({
    where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } },
    orderBy: { createdAt: 'asc' },
  });
  if (!owner) throw new Error('No hay ningún administrador. Ejecuta primero el seed.');

  // Usuario técnico al que se asocian los huéspedes que vinieron por otras plataformas.
  const guestAccount =
    (await prisma.user.findUnique({ where: { email: 'huespedes.importados@pyfgroupsac.com' } })) ??
    (await prisma.user.create({
      data: {
        email: 'huespedes.importados@pyfgroupsac.com',
        password: await argon2.hash(`import-${Date.now()}-${Math.random()}`),
        firstName: 'Huésped',
        lastName: 'Externo',
        role: Role.USER,
        isActive: false,
      },
    }));

  const category = await prisma.category.findFirst({ where: { slug: 'departamento' } });
  if (!category) throw new Error('Falta la categoría "Departamento". Ejecuta primero el seed.');

  const department = await prisma.department.findFirst({ where: { slug: 'lima' } });
  const province = await prisma.province.findFirst({
    where: { slug: 'lima', departmentId: department?.id },
  });
  const district = await prisma.district.findFirst({
    where: { provinceId: province?.id, slug: { in: ['cercado-de-lima', 'lima'] } },
  });
  if (!department || !province) throw new Error('Falta la ubicación Lima. Ejecuta primero el seed.');

  // ------------------------- alojamientos por dpto -------------------------
  const dptos = [...new Set(payload.reservations.map((r) => r.dpto))].sort(
    (a, b) => Number(a) - Number(b),
  );
  const propertyByDpto = new Map<string, string>();

  for (const dpto of dptos) {
    const title = `Departamento ${dpto}`;
    const slug = slugify(title);

    const existing = await prisma.property.findUnique({ where: { slug } });
    if (existing) {
      propertyByDpto.set(dpto, existing.id);
      continue;
    }

    // Precio de referencia: la media de lo cobrado ese mes.
    const prices = payload.reservations
      .filter((r) => r.dpto === dpto && r.pricePerNight > 0)
      .map((r) => r.pricePerNight);
    const avgPrice = prices.length
      ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
      : 150;

    const created = await prisma.$transaction(async (tx) => {
      const location = await tx.location.create({
        data: {
          departmentId: department.id,
          provinceId: province.id,
          districtId: district?.id,
        },
      });

      return tx.property.create({
        data: {
          title,
          slug,
          shortDescription: `Departamento ${dpto} · Cercado de Lima`,
          description:
            `Departamento ${dpto} en Cercado de Lima, equipado para estadías cortas y largas. ` +
            'Cocina completa, agua caliente y wifi. Importado desde el control de ocupación; ' +
            'completa la descripción y las fotos desde el panel.',
          pricePerNight: avgPrice,
          maxGuests: 4,
          bedrooms: 1,
          beds: 2,
          bathrooms: 1,
          status: PropertyStatus.DRAFT,
          ownerId: owner.id,
          categoryId: category.id,
          locationId: location.id,
        },
      });
    });

    propertyByDpto.set(dpto, created.id);
    console.log(`   + ${title} (S/ ${avgPrice} promedio)`);
  }

  // ------------------------------- reservas -------------------------------
  let created = 0;
  let updated = 0;

  for (const item of payload.reservations) {
    const propertyId = propertyByDpto.get(item.dpto);
    if (!propertyId) continue;

    // La columna `code` es VarChar(20): I + dpto(4) + YYMMDD(6) + huésped(3) = 14.
    // El sufijo del huésped evita colisiones cuando dos reservas del mismo
    // departamento empiezan el mismo día.
    const suffix = (slugify(item.guest).replace(/-/g, '').slice(0, 3) || 'x').toUpperCase();
    const code = `I${item.dpto}${item.checkIn.replace(/-/g, '').slice(2)}${suffix}`;
    const channel = (Object.values(BookingChannel) as string[]).includes(item.channel)
      ? (item.channel as BookingChannel)
      : BookingChannel.OTHER;

    const data = {
      propertyId,
      userId: guestAccount.id,
      checkIn: new Date(`${item.checkIn}T00:00:00Z`),
      checkOut: new Date(`${item.checkOut}T00:00:00Z`),
      guests: 2,
      nights: item.nights,
      pricePerNight: item.pricePerNight,
      cleaningFee: 0,
      totalPrice: item.pricePerNight * item.nights,
      status: statusFromPaymentCode(item.paymentCode),
      channel,
      guestName: item.guest,
      notes: 'Importado desde la hoja de ocupación',
    };

    const existing = await prisma.reservation.findUnique({ where: { code } });
    if (existing) {
      await prisma.reservation.update({ where: { code }, data });
      updated += 1;
    } else {
      await prisma.reservation.create({ data: { code, ...data } });
      created += 1;
    }
  }

  console.log(`✓ ${created} reservas creadas, ${updated} actualizadas, ${dptos.length} departamentos.`);
  console.log('  Los alojamientos se crean como BORRADOR: revísalos y publícalos desde el panel.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
