/* eslint-disable no-console */
/**
 * Planes de publicación para anfitriones.
 *
 * Los precios viven en la base, no en el código: esto sólo los crea la primera
 * vez. Si ya existen, no los pisa — para cambiar un precio se edita desde el
 * panel o con un UPDATE, no volviendo a correr esto.
 *
 *     npm run seed:planes
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLANES = [
  {
    code: 'mes',
    name: '30 días',
    days: 30,
    price: 30,
    tagline: 'Para probar sin comprometerte',
    features: [
      'Alojamientos ilimitados',
      'Calendario y reservas',
      'Contacto directo por WhatsApp',
      'Tu perfil público de anfitrión',
    ],
    isPopular: false,
    sortOrder: 1,
  },
  {
    code: 'bimestre',
    name: '2 meses',
    days: 60,
    price: 50,
    tagline: 'S/ 25 al mes · ahorras 17%',
    features: [
      'Todo lo del plan de 30 días',
      'Dos meses seguidos sin renovar',
      'Prioridad en el orden de búsqueda',
    ],
    isPopular: true,
    sortOrder: 2,
  },
  {
    code: 'semestre',
    name: '7 meses',
    days: 210,
    price: 150,
    tagline: 'S/ 21.43 al mes · ahorras 29%',
    features: [
      'Todo lo del plan de 2 meses',
      'Siete meses seguidos, el mejor precio',
      'Soporte prioritario',
    ],
    isPopular: false,
    sortOrder: 3,
  },
];

async function main() {
  console.log(`Sincronizando ${PLANES.length} planes…`);

  let creados = 0;
  for (const plan of PLANES) {
    const existente = await prisma.hostPlan.findUnique({ where: { code: plan.code } });
    if (existente) {
      console.log(`   · ${plan.name}: ya existe, no se toca (S/ ${existente.price})`);
      continue;
    }

    await prisma.hostPlan.create({ data: plan });
    console.log(`   + ${plan.name} — S/ ${plan.price} por ${plan.days} días`);
    creados += 1;
  }

  const total = await prisma.hostPlan.count({ where: { isActive: true } });
  console.log(`\n✓ ${creados} creados · ${total} planes activos`);
}

main()
  .catch((error) => {
    console.error('Error creando los planes:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
