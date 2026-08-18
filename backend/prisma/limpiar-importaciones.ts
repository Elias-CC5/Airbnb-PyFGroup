/* eslint-disable no-console */
/**
 * Deja la base lista para volver a importar la hoja de ocupación.
 *
 * Borra SÓLO lo que creó el importador: las reservas con la nota
 * "Importado desde la hoja de ocupación" y, después, los alojamientos
 * `departamento-*` que quedaron sin ninguna reserva. Las reservas hechas por
 * usuarios desde la web y los alojamientos con contenido propio no se tocan.
 *
 * Por defecto sólo informa. Para que borre de verdad hay que pasar --aplicar:
 *
 *     npx ts-node prisma/limpiar-importaciones.ts            # simulacro
 *     npx ts-node prisma/limpiar-importaciones.ts --aplicar  # borra
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APLICAR = process.argv.includes('--aplicar');
const NOTA_IMPORT = 'Importado desde la hoja de ocupación';

async function main() {
  const reservas = await prisma.reservation.count({ where: { notes: NOTA_IMPORT } });
  const totalReservas = await prisma.reservation.count();

  console.log(`Reservas importadas: ${reservas} de ${totalReservas} en total`);

  if (APLICAR) {
    const { count } = await prisma.reservation.deleteMany({ where: { notes: NOTA_IMPORT } });
    console.log(`   ✓ ${count} reservas eliminadas`);
  }

  // Alojamientos que creó el importador y que ya no tienen reservas colgando.
  const candidatos = await prisma.property.findMany({
    where: { slug: { startsWith: 'departamento-' } },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      _count: { select: { reservations: true, reviews: true, images: true } },
    },
    orderBy: { slug: 'asc' },
  });

  // Tras el borrado de arriba, _count.reservations ya refleja lo que queda.
  const huerfanos = candidatos.filter(
    (p) => p._count.reservations === 0 && p._count.reviews === 0 && p._count.images === 0,
  );

  console.log(`\nAlojamientos "departamento-*": ${candidatos.length}`);
  console.log(`Sin reservas, sin reseñas y sin fotos: ${huerfanos.length}`);
  for (const p of huerfanos) console.log(`   · ${p.slug} — ${p.title}`);

  if (APLICAR && huerfanos.length) {
    const ids = huerfanos.map((p) => p.id);
    const { count } = await prisma.property.deleteMany({ where: { id: { in: ids } } });
    console.log(`   ✓ ${count} alojamientos eliminados`);
  }

  if (!APLICAR) {
    console.log('\nSimulacro: no se borró nada. Repite con --aplicar para ejecutarlo.');
  } else {
    console.log('\nListo. Ahora vuelve a subir Ocupacion_PyFGroup.xlsx desde el calendario.');
  }
}

main()
  .catch((error) => {
    console.error('Error limpiando importaciones:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
