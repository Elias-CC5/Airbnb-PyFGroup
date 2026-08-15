/* eslint-disable no-console */
/**
 * Añade los 43 distritos de la provincia de Lima sin borrar nada.
 *
 *     npx ts-node prisma/add-lima-districts.ts
 *
 * Es idempotente: puede ejecutarse varias veces sin duplicar filas.
 * A diferencia de `npm run seed`, NO vacía la base de datos.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const slugify = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Los 43 distritos de la provincia de Lima. */
const LIMA_DISTRICTS = [
  'Cercado de Lima',
  'Ancón',
  'Ate',
  'Barranco',
  'Breña',
  'Carabayllo',
  'Chaclacayo',
  'Chorrillos',
  'Cieneguilla',
  'Comas',
  'El Agustino',
  'Independencia',
  'Jesús María',
  'La Molina',
  'La Victoria',
  'Lince',
  'Los Olivos',
  'Lurigancho',
  'Lurín',
  'Magdalena del Mar',
  'Miraflores',
  'Pachacámac',
  'Pucusana',
  'Pueblo Libre',
  'Puente Piedra',
  'Punta Hermosa',
  'Punta Negra',
  'Rímac',
  'San Bartolo',
  'San Borja',
  'San Isidro',
  'San Juan de Lurigancho',
  'San Juan de Miraflores',
  'San Luis',
  'San Martín de Porres',
  'San Miguel',
  'Santa Anita',
  'Santa María del Mar',
  'Santa Rosa',
  'Santiago de Surco',
  'Surquillo',
  'Villa El Salvador',
  'Villa María del Triunfo',
];

async function main() {
  const department = await prisma.department.findFirst({ where: { slug: 'lima' } });
  if (!department) throw new Error('No existe el departamento Lima. Ejecuta primero el seed.');

  const province = await prisma.province.findFirst({
    where: { slug: 'lima', departmentId: department.id },
  });
  if (!province) throw new Error('No existe la provincia Lima. Ejecuta primero el seed.');

  // Si una ejecución previa creó el distrito como "Lima", lo renombra
  // conservando su ID (y por tanto los alojamientos que lo referencian).
  const legacyCercado = await prisma.district.findUnique({
    where: { provinceId_slug: { provinceId: province.id, slug: 'lima' } },
  });
  if (legacyCercado) {
    await prisma.district.update({
      where: { id: legacyCercado.id },
      data: { name: 'Cercado de Lima', slug: 'cercado-de-lima' },
    });
    console.log('   ~ "Lima" → "Cercado de Lima"');
  }

  let created = 0;
  for (const name of LIMA_DISTRICTS) {
    const slug = slugify(name);
    const existing = await prisma.district.findUnique({
      where: { provinceId_slug: { provinceId: province.id, slug } },
    });

    if (existing) {
      // Corrige el nombre si difiere (p. ej. tildes) pero conserva el ID.
      if (existing.name !== name) {
        await prisma.district.update({ where: { id: existing.id }, data: { name } });
        console.log(`   ~ ${existing.name} → ${name}`);
      }
      continue;
    }

    await prisma.district.create({ data: { name, slug, provinceId: province.id } });
    created += 1;
  }

  // "Surco" del seed original quedó reemplazado por "Santiago de Surco".
  const legacySurco = await prisma.district.findUnique({
    where: { provinceId_slug: { provinceId: province.id, slug: 'surco' } },
    include: { _count: { select: { locations: true } } },
  });

  if (legacySurco) {
    if (legacySurco._count.locations === 0) {
      await prisma.district.delete({ where: { id: legacySurco.id } });
      console.log('   - "Surco" eliminado (duplicado de "Santiago de Surco")');
    } else {
      console.log(
        `   ! "Surco" conserva ${legacySurco._count.locations} alojamiento(s); muévelos a "Santiago de Surco" y bórralo a mano.`,
      );
    }
  }

  const total = await prisma.district.count({ where: { provinceId: province.id } });
  console.log(`✓ ${created} distrito(s) nuevo(s). Lima tiene ahora ${total}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
