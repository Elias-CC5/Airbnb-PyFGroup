/* eslint-disable no-console */
/**
 * Datos de prueba para desarrollo.
 *
 * ⚠️  Las credenciales generadas aquí son SÓLO PARA DESARROLLO.
 *     Cámbialas obligatoriamente antes de desplegar a producción.
 *
 *     npm run seed
 */
import {
  Currency,
  PrismaClient,
  Property,
  PropertyStatus,
  Reservation,
  ReservationStatus,
  Role,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const slugify = (v: string) =>
  v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// ----------------------------- Fotografías -----------------------------
/**
 * Fotos de Unsplash agrupadas por ambiente. Si alguna URL dejara de existir,
 * basta con reemplazar el ID dentro del pool correspondiente.
 */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const PHOTOS = {
  interior: [
    '1586023492125-27b2c045efd7',
    '1502672260266-1c1ef2d93688',
    '1493809842364-78817add7ffb',
    '1560448204-e02f11c3d0e2',
    '1522708323590-d24dbb6b0267',
  ],
  montana: [
    '1506905925346-21bda4d32df4',
    '1464822759023-fed622ff2c3b',
    '1454391304352-2bf4678b1a7a',
    '1518602164578-cd0074062767',
    '1441974231531-c6227db76b6e',
  ],
  playa: [
    '1507525428034-b723cf961d3e',
    '1519046904884-53103b34b206',
    '1505228395891-9a51e7e86bf6',
    '1471922694854-ff1b63b20054',
    '1439066615861-d1af74d74000',
  ],
  ciudad: [
    '1502005229762-cf1b2da7c5d6',
    '1484154218962-a197022b5858',
    '1524758631624-e2822e304c36',
    '1449824913935-59a10b8d2000',
    '1522708323590-d24dbb6b0267',
  ],
  selva: [
    '1470071459604-3b5ec3a7fe05',
    '1500382017468-9049fed747ef',
    '1518495973542-4542c06a5843',
    '1447752875215-b2761acb3c5d',
    '1441974231531-c6227db76b6e',
  ],
} as const;

type PhotoTheme = keyof typeof PHOTOS;

/** Elige el ambiente adecuado según el tipo de alojamiento y su región. */
const themeFor = (category: string, department: string): PhotoTheme => {
  if (category === 'Casa de playa') return 'playa';
  if (category === 'Lodge' || department === 'Loreto') return 'selva';
  if (category === 'Cabaña' || category === 'Casa de campo') return 'montana';
  if (category === 'Departamento' || category === 'Habitación privada') return 'ciudad';
  if (category === 'Villa') return 'playa';
  return 'interior';
};

const pick = (theme: PhotoTheme, index: number) =>
  UNSPLASH(PHOTOS[theme][index % PHOTOS[theme].length]);

/** Ambiente representativo de cada departamento, para la sección "Destinos". */
const DEPARTMENT_THEME: Record<string, PhotoTheme> = {
  Cusco: 'montana',
  Lima: 'ciudad',
  Arequipa: 'montana',
  Ica: 'playa',
  Piura: 'playa',
  'La Libertad': 'playa',
  Puno: 'montana',
  Junín: 'montana',
  Áncash: 'montana',
  Loreto: 'selva',
};

// ------------------------- Ubicaciones (Perú) -------------------------
const GEO: Record<string, Record<string, string[]>> = {
  Cusco: {
    Cusco: ['Cusco', 'San Blas', 'Wanchaq', 'San Jerónimo'],
    Urubamba: ['Urubamba', 'Ollantaytambo', 'Machupicchu'],
    Calca: ['Calca', 'Pisac'],
  },
  Lima: {
    Lima: ['Miraflores', 'Barranco', 'San Isidro', 'Surco'],
    Cañete: ['Asia', 'Cerro Azul'],
    Huaral: ['Huaral', 'Chancay'],
  },
  Arequipa: {
    Arequipa: ['Cercado', 'Yanahuara', 'Cayma'],
    Caylloma: ['Chivay', 'Cabanaconde'],
  },
  Ica: {
    Ica: ['Ica', 'Huacachina'],
    Pisco: ['Paracas', 'Pisco'],
    Nasca: ['Nasca'],
  },
  Piura: {
    Talara: ['Máncora', 'Los Órganos'],
    Piura: ['Piura', 'Catacaos'],
  },
  'La Libertad': {
    Trujillo: ['Trujillo', 'Huanchaco'],
    Ascope: ['Chicama'],
  },
  Puno: {
    Puno: ['Puno', 'Chucuito'],
  },
  Junín: {
    Huancayo: ['Huancayo', 'Concepción'],
  },
  Áncash: {
    Huaraz: ['Huaraz', 'Independencia'],
    Santa: ['Chimbote'],
  },
  Loreto: {
    Maynas: ['Iquitos', 'Belén'],
  },
};

const CATEGORIES = [
  { name: 'Casa completa', icon: 'home', description: 'Toda la casa para tu grupo' },
  { name: 'Departamento', icon: 'building', description: 'Cómodos y bien ubicados' },
  { name: 'Cabaña', icon: 'trees', description: 'Escapadas de naturaleza' },
  { name: 'Casa de playa', icon: 'waves', description: 'Frente al mar del norte y sur' },
  { name: 'Casa de campo', icon: 'mountain', description: 'Aire puro y tranquilidad' },
  { name: 'Habitación privada', icon: 'bed-double', description: 'Opción económica' },
  { name: 'Lodge', icon: 'tent-tree', description: 'Experiencias en la selva' },
  { name: 'Villa', icon: 'castle', description: 'Estadías de lujo' },
];

const AMENITIES = [
  { name: 'WiFi', icon: 'wifi', group: 'Esenciales' },
  { name: 'Cocina equipada', icon: 'chef-hat', group: 'Esenciales' },
  { name: 'Agua caliente', icon: 'shower-head', group: 'Esenciales' },
  { name: 'Ropa de cama', icon: 'bed-double', group: 'Esenciales' },
  { name: 'Estacionamiento', icon: 'car', group: 'Exteriores' },
  { name: 'Piscina', icon: 'waves', group: 'Exteriores' },
  { name: 'Jardín', icon: 'trees', group: 'Exteriores' },
  { name: 'Parrilla', icon: 'flame', group: 'Exteriores' },
  { name: 'Terraza', icon: 'sun', group: 'Exteriores' },
  { name: 'TV con cable', icon: 'tv', group: 'Entretenimiento' },
  { name: 'Aire acondicionado', icon: 'wind', group: 'Climatización' },
  { name: 'Calefacción', icon: 'thermometer-sun', group: 'Climatización' },
  { name: 'Chimenea', icon: 'flame', group: 'Climatización' },
  { name: 'Lavadora', icon: 'washing-machine', group: 'Servicios' },
  { name: 'Desayuno incluido', icon: 'coffee', group: 'Servicios' },
  { name: 'Apto para mascotas', icon: 'paw-print', group: 'Servicios' },
  { name: 'Detector de humo', icon: 'siren', group: 'Seguridad' },
  { name: 'Botiquín', icon: 'briefcase-medical', group: 'Seguridad' },
];

const PROPERTIES = [
  { title: 'Casa andina con vista al valle sagrado', dep: 'Cusco', prov: 'Urubamba', dist: 'Ollantaytambo', cat: 'Casa completa', price: 285, guests: 6, bedrooms: 3, bathrooms: 2, featured: true },
  { title: 'Loft colonial en San Blas', dep: 'Cusco', prov: 'Cusco', dist: 'San Blas', cat: 'Departamento', price: 190, guests: 3, bedrooms: 1, bathrooms: 1, featured: true },
  { title: 'Cabaña de madera frente a las montañas', dep: 'Áncash', prov: 'Huaraz', dist: 'Huaraz', cat: 'Cabaña', price: 220, guests: 5, bedrooms: 2, bathrooms: 2, featured: true },
  { title: 'Casa de playa en Máncora con piscina', dep: 'Piura', prov: 'Talara', dist: 'Máncora', cat: 'Casa de playa', price: 420, guests: 8, bedrooms: 4, bathrooms: 3, featured: true },
  { title: 'Departamento moderno en Miraflores', dep: 'Lima', prov: 'Lima', dist: 'Miraflores', cat: 'Departamento', price: 260, guests: 4, bedrooms: 2, bathrooms: 2, featured: true },
  { title: 'Casa bohemia en Barranco', dep: 'Lima', prov: 'Lima', dist: 'Barranco', cat: 'Casa completa', price: 340, guests: 6, bedrooms: 3, bathrooms: 2, featured: false },
  { title: 'Bungalow en Paracas a 5 min de la reserva', dep: 'Ica', prov: 'Pisco', dist: 'Paracas', cat: 'Casa de playa', price: 300, guests: 6, bedrooms: 3, bathrooms: 2, featured: true },
  { title: 'Oasis en Huacachina con terraza', dep: 'Ica', prov: 'Ica', dist: 'Huacachina', cat: 'Casa completa', price: 175, guests: 4, bedrooms: 2, bathrooms: 1, featured: false },
  { title: 'Casona sillar en Yanahuara', dep: 'Arequipa', prov: 'Arequipa', dist: 'Yanahuara', cat: 'Casa completa', price: 265, guests: 7, bedrooms: 3, bathrooms: 2, featured: true },
  { title: 'Refugio en el Colca con desayuno', dep: 'Arequipa', prov: 'Caylloma', dist: 'Chivay', cat: 'Lodge', price: 210, guests: 4, bedrooms: 2, bathrooms: 1, featured: false },
  { title: 'Casa junto al lago Titicaca', dep: 'Puno', prov: 'Puno', dist: 'Chucuito', cat: 'Casa de campo', price: 195, guests: 5, bedrooms: 2, bathrooms: 2, featured: false },
  { title: 'Villa con piscina privada en Asia', dep: 'Lima', prov: 'Cañete', dist: 'Asia', cat: 'Villa', price: 690, guests: 10, bedrooms: 5, bathrooms: 4, featured: true },
  { title: 'Departamento frente al mar en Huanchaco', dep: 'La Libertad', prov: 'Trujillo', dist: 'Huanchaco', cat: 'Departamento', price: 180, guests: 4, bedrooms: 2, bathrooms: 1, featured: false },
  { title: 'Lodge amazónico cerca de Iquitos', dep: 'Loreto', prov: 'Maynas', dist: 'Belén', cat: 'Lodge', price: 320, guests: 6, bedrooms: 3, bathrooms: 2, featured: true },
  { title: 'Casa de campo en el valle del Mantaro', dep: 'Junín', prov: 'Huancayo', dist: 'Concepción', cat: 'Casa de campo', price: 165, guests: 6, bedrooms: 3, bathrooms: 2, featured: false },
  { title: 'Habitación privada en Los Órganos', dep: 'Piura', prov: 'Talara', dist: 'Los Órganos', cat: 'Habitación privada', price: 95, guests: 2, bedrooms: 1, bathrooms: 1, featured: false },
  { title: 'Ático con vista a la ciudad en San Isidro', dep: 'Lima', prov: 'Lima', dist: 'San Isidro', cat: 'Departamento', price: 380, guests: 4, bedrooms: 2, bathrooms: 2, featured: false },
  { title: 'Cabaña familiar en Pisac', dep: 'Cusco', prov: 'Calca', dist: 'Pisac', cat: 'Cabaña', price: 230, guests: 6, bedrooms: 3, bathrooms: 2, featured: false },
];

const DESCRIPTION = (title: string, place: string) =>
  `${title} es un espacio pensado para que descanses de verdad. Ubicado en ${place}, combina ambientes amplios y luminosos con detalles de decoración local hechos por artesanos de la zona.\n\n` +
  `Tendrás una sala cómoda para reunirte, cocina totalmente equipada para preparar tus propias comidas y dormitorios con ropa de cama premium. Los espacios exteriores son ideales para desayunar con calma o cerrar el día conversando.\n\n` +
  `El anfitrión responde rápido por WhatsApp y puede ayudarte con recomendaciones de restaurantes, transporte y tours cercanos. Check-in flexible previa coordinación.`;

async function main() {
  console.log('🌱  Sembrando base de datos...');

  // Orden inverso a las dependencias
  await prisma.review.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.availabilityBlock.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.location.deleteMany();
  await prisma.district.deleteMany();
  await prisma.province.deleteMany();
  await prisma.department.deleteMany();
  await prisma.category.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  // ------------------------------ ubicaciones ------------------------------
  const departmentIds = new Map<string, number>();
  const provinceIds = new Map<string, number>();
  const districtIds = new Map<string, number>();

  for (const [depIndex, [depName, provinces]] of Object.entries(GEO).entries()) {
    const department = await prisma.department.create({
      data: {
        name: depName,
        slug: slugify(depName),
        imageUrl: pick(DEPARTMENT_THEME[depName] ?? 'montana', depIndex),
      },
    });
    departmentIds.set(depName, department.id);

    for (const [provName, districts] of Object.entries(provinces)) {
      const province = await prisma.province.create({
        data: { name: provName, slug: slugify(provName), departmentId: department.id },
      });
      provinceIds.set(`${depName}|${provName}`, province.id);

      for (const distName of districts) {
        const district = await prisma.district.create({
          data: { name: distName, slug: slugify(distName), provinceId: province.id },
        });
        districtIds.set(`${depName}|${provName}|${distName}`, district.id);
      }
    }
  }
  console.log(
    `   ✓ ${departmentIds.size} departamentos, ${provinceIds.size} provincias, ${districtIds.size} distritos`,
  );

  // ------------------------------ catálogo ------------------------------
  const categoryIds = new Map<string, number>();
  for (const [i, c] of CATEGORIES.entries()) {
    const created = await prisma.category.create({
      data: {
        ...c,
        slug: slugify(c.name),
        order: i,
        imageUrl: pick(themeFor(c.name, ''), i),
      },
    });
    categoryIds.set(c.name, created.id);
  }

  const amenityIds: number[] = [];
  for (const a of AMENITIES) {
    const created = await prisma.amenity.create({ data: { ...a, slug: slugify(a.name) } });
    amenityIds.push(created.id);
  }
  console.log(`   ✓ ${CATEGORIES.length} categorías, ${AMENITIES.length} amenidades`);

  // ------------------------------ usuarios ------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@wasi.pe';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const hash = (p: string) => argon2.hash(p, { type: argon2.argon2id });

  const admin = await prisma.user.create({
    data: {
      firstName: 'Camila',
      lastName: 'Rojas',
      email: adminEmail,
      phone: '+51 999 888 777',
      password: await hash(adminPassword),
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const host = await prisma.user.create({
    data: {
      firstName: 'Mateo',
      lastName: 'Salazar',
      email: 'anfitrion@wasi.pe',
      phone: '+51 988 777 666',
      password: await hash('Anfitrion123!'),
      role: Role.HOST,
      emailVerified: true,
    },
  });

  const guests = await Promise.all(
    [
      ['Lucía', 'Fernández', 'lucia@correo.com'],
      ['Diego', 'Ramos', 'diego@correo.com'],
      ['Valeria', 'Chávez', 'valeria@correo.com'],
      ['Andrés', 'Quispe', 'andres@correo.com'],
    ].map(async ([firstName, lastName, email]) =>
      prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone: '+51 900 000 000',
          password: await hash('Usuario123!'),
          role: Role.USER,
          emailVerified: true,
        },
      }),
    ),
  );
  console.log(`   ✓ ${2 + guests.length} usuarios`);

  // ---------------------------- alojamientos ----------------------------
  const createdProperties: Property[] = [];

  for (const [index, p] of PROPERTIES.entries()) {
    const departmentId = departmentIds.get(p.dep)!;
    const provinceId = provinceIds.get(`${p.dep}|${p.prov}`)!;
    const districtId = districtIds.get(`${p.dep}|${p.prov}|${p.dist}`)!;
    const place = `${p.dist}, ${p.dep}`;
    const theme = themeFor(p.cat, p.dep);

    // La ubicación se crea antes: Prisma no permite mezclar FK escalares
    // (ownerId, categoryId) con escrituras anidadas de una relación propia.
    const location = await prisma.location.create({
      data: {
        departmentId,
        provinceId,
        districtId,
        address: `Calle ${index + 1} s/n`,
        reference: 'A pocos minutos del centro',
      },
    });

    const property = await prisma.property.create({
      data: {
        title: p.title,
        slug: `${slugify(p.title)}-${slugify(p.dist)}`,
        shortDescription: `${p.bedrooms} habitaciones · ${p.guests} huéspedes · ${place}`,
        description: DESCRIPTION(p.title, place),
        pricePerNight: p.price,
        currency: Currency.PEN,
        cleaningFee: Math.round(p.price * 0.12),
        maxGuests: p.guests,
        bedrooms: p.bedrooms,
        beds: p.bedrooms + 1,
        bathrooms: p.bathrooms,
        minNights: 2,
        status: PropertyStatus.ACTIVE,
        isFeatured: p.featured,
        views: 40 + index * 17,
        whatsappPhone: '51930983811',
        ownerId: index % 3 === 0 ? host.id : admin.id,
        categoryId: categoryIds.get(p.cat)!,
        locationId: location.id,
        images: {
          // La primera foto es la del ambiente principal; el resto rota el pool
          // desplazado por el índice para que no se repitan entre alojamientos.
          create: Array.from({ length: 5 }, (_, i) => ({
            url: pick(theme, index + i),
            alt: `${p.title} — foto ${i + 1}`,
            order: i,
            isMain: i === 0,
            width: 1200,
            height: 800,
          })),
        },
        amenities: {
          create: amenityIds
            .filter((_, i) => (i + index) % 3 !== 0)
            .slice(0, 9)
            .map((amenityId) => ({ amenityId })),
        },
      },
    });

    createdProperties.push(property);
  }
  console.log(`   ✓ ${createdProperties.length} alojamientos con imágenes y amenidades`);

  // ------------------------------ reservas ------------------------------
  const day = (offset: number) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + offset);
    return d;
  };

  const plans: Array<{ offset: number; nights: number; status: ReservationStatus }> = [
    { offset: -60, nights: 4, status: ReservationStatus.COMPLETED },
    { offset: -45, nights: 3, status: ReservationStatus.COMPLETED },
    { offset: -30, nights: 5, status: ReservationStatus.COMPLETED },
    { offset: -15, nights: 2, status: ReservationStatus.CANCELLED },
    { offset: 12, nights: 3, status: ReservationStatus.CONFIRMED },
    { offset: 25, nights: 4, status: ReservationStatus.PENDING },
    { offset: 40, nights: 2, status: ReservationStatus.CONFIRMED },
    { offset: 55, nights: 6, status: ReservationStatus.PENDING },
  ];

  const reservations: Reservation[] = [];
  for (const [i, plan] of plans.entries()) {
    const property = createdProperties[i % createdProperties.length];
    const guest = guests[i % guests.length];
    const price = Number(property.pricePerNight);
    const cleaning = Number(property.cleaningFee);

    reservations.push(
      await prisma.reservation.create({
        data: {
          code: `WSI${String(1000 + i)}`,
          propertyId: property.id,
          userId: guest.id,
          checkIn: day(plan.offset),
          checkOut: day(plan.offset + plan.nights),
          guests: Math.min(2 + (i % 3), property.maxGuests),
          nights: plan.nights,
          pricePerNight: price,
          cleaningFee: cleaning,
          totalPrice: price * plan.nights + cleaning,
          status: plan.status,
          createdAt: day(plan.offset - 10),
          ...(plan.status === ReservationStatus.CANCELLED
            ? { cancelledAt: day(plan.offset - 3), cancelReason: 'Cambio de planes del huésped' }
            : {}),
        },
      }),
    );
  }
  console.log(`   ✓ ${reservations.length} reservas`);

  // ------------------------------ reseñas ------------------------------
  const comments = [
    'La casa superó nuestras expectativas: impecable, cómoda y con una vista increíble. El anfitrión respondió al instante.',
    'Excelente ubicación y muy tranquila. Volveríamos sin dudarlo, ideal para descansar en familia.',
    'Todo tal cual las fotos. La cocina está muy bien equipada y el check-in fue rapidísimo.',
  ];

  const completed = reservations.filter((r) => r.status === ReservationStatus.COMPLETED);
  for (const [i, reservation] of completed.entries()) {
    await prisma.review.create({
      data: {
        propertyId: reservation.propertyId,
        userId: reservation.userId,
        reservationId: reservation.id,
        rating: 5 - (i % 2),
        comment: comments[i % comments.length],
      },
    });
  }

  // Recalcula ratings
  for (const property of createdProperties) {
    const agg = await prisma.review.aggregate({
      where: { propertyId: property.id, isVisible: true },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.property.update({
      where: { id: property.id },
      data: {
        ratingAvg: Number((agg._avg.rating ?? 4.8).toFixed(2)),
        reviewsCount: agg._count._all,
      },
    });
  }
  console.log(`   ✓ ${completed.length} reseñas`);

  // ----------------------------- favoritos -----------------------------
  await prisma.favorite.createMany({
    data: guests.flatMap((g, i) =>
      createdProperties.slice(i, i + 3).map((p) => ({ userId: g.id, propertyId: p.id })),
    ),
    skipDuplicates: true,
  });

  console.log('\n✅  Seed completado.\n');
  console.log('   ──────────────────────────────────────────────');
  console.log('   CREDENCIALES — SÓLO DESARROLLO. CÁMBIALAS.');
  console.log('   ──────────────────────────────────────────────');
  console.log(`   Admin      : ${adminEmail} / ${adminPassword}`);
  console.log('   Anfitrión  : anfitrion@wasi.pe / Anfitrion123!');
  console.log('   Usuario    : lucia@correo.com / Usuario123!');
  console.log('   ──────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌  Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });