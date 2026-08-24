/* eslint-disable no-console */
/**
 * Carga la ocupación histórica en la base, sin pasar por el importador de Excel.
 *
 * Las estadías vienen ya calculadas y verificadas en `ocupacion.json`: se
 * extrajeron del control de ocupación noche por noche y cada mes cuadra al
 * céntimo contra el Excel. Leerlas de aquí evita los tres problemas que tenía
 * la lectura directa de la hoja: bloques sin fila de números de día, noches con
 * precio pero sin nombre de huésped, y filas de totales semanales etiquetadas
 * como si fueran un departamento.
 *
 * Es idempotente: borra la carga anterior y vuelve a insertar. Sólo toca lo
 * suyo — las reservas hechas por usuarios desde la web no se tocan.
 *
 *     npx ts-node prisma/cargar-ocupacion.ts               # simulacro
 *     npx ts-node prisma/cargar-ocupacion.ts --aplicar     # escribe
 */
import {
  BookingChannel,
  PrismaClient,
  PropertyStatus,
  ReservationStatus,
  Role,
} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const APLICAR = process.argv.includes('--aplicar');
const NOTA = 'Importado desde la hoja de ocupación';
const EMAIL_HUESPEDES = 'huespedes.importados@pyfgroupsac.com';

interface Estadia {
  dpto: number;
  guest: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  pricePerNight: number;
  channel: keyof typeof BookingChannel;
  status: keyof typeof ReservationStatus;
  code: string;
}

/** Cifras del Excel, para verificar al final que la carga quedó bien. */
const ESPERADO: Record<string, number> = {
  '2026-08': 24086.1,
  '2026-09': 2780.0,
};

const soles = (n: number) =>
  `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function main() {
  const ruta = path.join(__dirname, 'ocupacion.json');
  if (!fs.existsSync(ruta)) {
    throw new Error(`No encuentro ${ruta}. Debe estar junto a este script.`);
  }

  const estadias: Estadia[] = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
  const dptos = [...new Set(estadias.map((e) => e.dpto))].sort((a, b) => a - b);

  console.log(`Archivo: ${estadias.length} estadías, ${dptos.length} departamentos`);

  // ------------------------------ simulacro ------------------------------
  if (!APLICAR) {
    const actuales = await prisma.reservation.count({ where: { notes: NOTA } });
    const props = await prisma.property.count({ where: { slug: { startsWith: 'departamento-' } } });
    console.log(`\nEn la base hay ahora: ${actuales} reservas importadas, ${props} alojamientos "departamento-*"`);
    console.log(`Se reemplazarían por: ${estadias.length} reservas, ${dptos.length} alojamientos`);
    resumen(estadias);
    console.log('\nSimulacro: no se escribió nada. Repite con --aplicar.');
    return;
  }

  // --------------------------- catálogos base ---------------------------
  // Dueño de las fichas: un administrador vivo y de carne y hueso. Se excluyen
  // los borrados y la cuenta técnica de huéspedes importados, que en algún
  // momento quedó con rol ADMIN por error.
  const owner =
    (await prisma.user.findFirst({
      where: {
        role: { in: [Role.SUPER_ADMIN, Role.ADMIN] },
        deletedAt: null,
        email: { not: EMAIL_HUESPEDES },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    })) ?? null;

  if (!owner) {
    const candidatos = await prisma.user.findMany({
      where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN] } },
      select: { email: true, role: true, deletedAt: true },
    });
    console.error('\nNo encontré un administrador activo. Lo que hay en esta base:');
    console.table(candidatos);
    console.error(
      '\nSi la lista sale vacía o no reconoces esos correos, el script se conectó a otra ' +
        'base de datos: revisa que DATABASE_URL vaya entre comillas dobles.',
    );
    throw new Error('No hay ningún administrador activo en el sistema');
  }

  console.log(`Dueño de las fichas: ${owner.email} (${owner.role})`);

  const category = await prisma.category.findFirst({ where: { slug: 'departamento' } });
  const department = await prisma.department.findFirst({ where: { slug: 'lima' } });
  const province = department
    ? await prisma.province.findFirst({ where: { slug: 'lima', departmentId: department.id } })
    : null;
  if (!category || !department || !province) {
    throw new Error('Faltan catálogos base (categoría "departamento" o ubicación de Lima)');
  }
  const district = await prisma.district.findFirst({
    where: { provinceId: province.id, slug: { in: ['cercado-de-lima', 'lima'] } },
  });

  const huesped = await cuentaHuespedes();

  // ------------------------------- limpieza ------------------------------
  const borradas = await prisma.reservation.deleteMany({ where: { notes: NOTA } });
  console.log(`\n✓ ${borradas.count} reservas de la carga anterior eliminadas`);

  const huerfanos = await prisma.property.findMany({
    where: {
      slug: { startsWith: 'departamento-' },
      reservations: { none: {} },
      reviews: { none: {} },
      images: { none: {} },
    },
    select: { id: true, slug: true },
  });
  const sobran = huerfanos.filter((p) => !dptos.some((d) => p.slug === `departamento-${d}`));
  if (sobran.length) {
    await prisma.property.deleteMany({ where: { id: { in: sobran.map((p) => p.id) } } });
    console.log(`✓ ${sobran.length} alojamientos sin datos eliminados: ${sobran.map((p) => p.slug).join(', ')}`);
  }

  // ----------------------------- alojamientos ----------------------------
  const idPorDpto = new Map<number, string>();

  for (const dpto of dptos) {
    const slug = `departamento-${dpto}`;
    const existente = await prisma.property.findUnique({ where: { slug } });
    if (existente) {
      idPorDpto.set(dpto, existente.id);
      continue;
    }

    const delDpto = estadias.filter((e) => e.dpto === dpto && e.pricePerNight > 0);
    const promedio = delDpto.length
      ? Math.round(delDpto.reduce((s, e) => s + e.pricePerNight, 0) / delDpto.length)
      : 150;

    const creado = await prisma.$transaction(async (tx) => {
      const location = await tx.location.create({
        data: { departmentId: department.id, provinceId: province.id, districtId: district?.id },
      });
      return tx.property.create({
        data: {
          title: `Departamento ${dpto}`,
          slug,
          shortDescription: `Departamento ${dpto} · Cercado de Lima`,
          description:
            `Departamento ${dpto} en Cercado de Lima, equipado para estadías cortas y largas. ` +
            'Ficha creada al cargar el control de ocupación; completa la descripción y las fotos.',
          pricePerNight: promedio,
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

    idPorDpto.set(dpto, creado.id);
    console.log(`  + ${slug}`);
  }

  // ------------------------------- reservas ------------------------------
  const filas = estadias.map((e) => ({
    code: e.code,
    propertyId: idPorDpto.get(e.dpto)!,
    userId: huesped.id,
    checkIn: new Date(`${e.checkIn}T00:00:00Z`),
    checkOut: new Date(`${e.checkOut}T00:00:00Z`),
    guests: 2,
    nights: e.nights,
    pricePerNight: e.pricePerNight,
    cleaningFee: 0,
    totalPrice: e.totalPrice,
    status: ReservationStatus[e.status],
    channel: BookingChannel[e.channel],
    guestName: e.guest,
    notes: NOTA,
  }));

  const LOTE = 200;
  let insertadas = 0;
  for (let i = 0; i < filas.length; i += LOTE) {
    const { count } = await prisma.reservation.createMany({
      data: filas.slice(i, i + LOTE),
      skipDuplicates: true,
    });
    insertadas += count;
    process.stdout.write(`\r  reservas: ${insertadas}/${filas.length}`);
  }
  console.log('');

  await verificar();
}

/** Cuenta técnica, desactivada, a la que se cuelgan los huéspedes externos. */
async function cuentaHuespedes() {
  const email = EMAIL_HUESPEDES;
  const existente = await prisma.user.findUnique({ where: { email } });

  if (existente) {
    // Es una cuenta técnica: no debe poder entrar ni tener permisos de panel.
    if (existente.role !== Role.USER || existente.isActive) {
      await prisma.user.update({
        where: { email },
        data: { role: Role.USER, isActive: false },
      });
      console.log(`  · ${email}: rol corregido a USER e inactivada`);
    }
    return existente;
  }

  // Contraseña aleatoria que nadie usa: la cuenta está desactivada y sólo
  // sirve para que las reservas externas tengan un userId válido.
  const argon2 = await import('argon2');
  return prisma.user.create({
    data: {
      email,
      password: await argon2.hash(crypto.randomBytes(32).toString('hex')),
      firstName: 'Huésped',
      lastName: 'Externo',
      role: Role.USER,
      isActive: false,
    },
  });
}

function resumen(estadias: Estadia[]) {
  const por = new Map<string, { n: number; noches: number; total: number }>();
  for (const e of estadias) {
    const mes = e.checkIn.slice(0, 7);
    const acc = por.get(mes) ?? { n: 0, noches: 0, total: 0 };
    acc.n += 1;
    acc.noches += e.nights;
    acc.total += e.totalPrice;
    por.set(mes, acc);
  }
  console.log(`\n${'mes'.padEnd(10)}${'estadías'.padStart(9)}${'noches'.padStart(8)}${'ingresos'.padStart(16)}`);
  for (const mes of [...por.keys()].sort()) {
    const a = por.get(mes)!;
    console.log(`${mes.padEnd(10)}${String(a.n).padStart(9)}${String(a.noches).padStart(8)}${soles(a.total).padStart(16)}`);
  }
}

/** Relee de la BASE (no del archivo) y compara contra el Excel. */
async function verificar() {
  const filas = await prisma.$queryRaw<Array<{ mes: string; total: string; noches: bigint }>>`
    SELECT to_char(date_trunc('month', "check_in"), 'YYYY-MM') AS mes,
           COALESCE(SUM("total_price"), 0)                     AS total,
           COALESCE(SUM(nights), 0)                            AS noches
    FROM reservations
    WHERE notes = ${NOTA}
    GROUP BY 1 ORDER BY 1
  `;

  console.log(`\n${'mes'.padEnd(10)}${'noches'.padStart(8)}${'en la base'.padStart(16)}${'en el Excel'.padStart(16)}${'dif'.padStart(10)}`);
  let ok = true;
  let total = 0;

  for (const f of filas) {
    const enBase = Number(f.total);
    const esperado = ESPERADO[f.mes];
    if (f.mes >= '2026-01' && f.mes <= '2026-08') total += enBase;

    if (esperado === undefined) {
      console.log(`${f.mes.padEnd(10)}${String(f.noches).padStart(8)}${soles(enBase).padStart(16)}${'—'.padStart(16)}${'—'.padStart(10)}`);
      continue;
    }
    const dif = enBase - esperado;
    if (Math.abs(dif) > 0.05) ok = false;
    console.log(
      `${f.mes.padEnd(10)}${String(f.noches).padStart(8)}${soles(enBase).padStart(16)}${soles(esperado).padStart(16)}${dif.toFixed(2).padStart(10)}`,
    );
  }

  console.log(`\nTotal enero–agosto 2026: ${soles(total)}   (esperado S/ 453,658.12)`);
  console.log(ok ? '\n✓ Todos los meses cuadran con el Excel.' : '\n✗ Hay meses que no cuadran — revisa el detalle de arriba.');
}

main()
  .catch((error) => {
    console.error('\nError cargando la ocupación:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
