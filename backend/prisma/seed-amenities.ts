/* eslint-disable no-console */
/**
 * Amenidades del catálogo, tomadas de la ficha real de los departamentos.
 *
 * Es idempotente: hace upsert por slug, así que se puede correr las veces que
 * haga falta sin duplicar nada y sin tocar las amenidades ya asignadas a un
 * alojamiento. Añadir una amenidad nueva aquí y volver a ejecutar es seguro.
 *
 *     npm run seed:amenidades
 */
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

interface AmenitySeed {
  name: string;
  icon: string;
  group: string;
}

const AMENITIES: AmenitySeed[] = [
  // ------------------------------- Baño --------------------------------
  { name: 'Secadora de pelo', icon: 'wind', group: 'Baño' },
  { name: 'Productos de limpieza', icon: 'spray-can', group: 'Baño' },
  { name: 'Agua caliente', icon: 'shower-head', group: 'Baño' },

  // ------------------------ Dormitorio y lavadero ----------------------
  { name: 'Lavadora en el edificio', icon: 'washing-machine', group: 'Dormitorio y lavadero' },
  { name: 'Secadora en el edificio', icon: 'wind', group: 'Dormitorio y lavadero' },
  { name: 'Sábanas de algodón', icon: 'bed-double', group: 'Dormitorio y lavadero' },
  { name: 'Almohadas y mantas adicionales', icon: 'bed', group: 'Dormitorio y lavadero' },
  { name: 'Cortinas opacas', icon: 'blinds', group: 'Dormitorio y lavadero' },
  { name: 'Plancha', icon: 'shirt', group: 'Dormitorio y lavadero' },
  { name: 'Armario para ropa', icon: 'archive', group: 'Dormitorio y lavadero' },

  // --------------------------- Entretenimiento -------------------------
  { name: 'Conexión ethernet', icon: 'ethernet-port', group: 'Entretenimiento' },
  { name: 'Smart TV 70" con Netflix y cable', icon: 'tv', group: 'Entretenimiento' },

  // ------------------------ Seguridad en el hogar ----------------------
  { name: 'Cámaras de seguridad exteriores', icon: 'cctv', group: 'Seguridad' },
  { name: 'Detector de humo', icon: 'siren', group: 'Seguridad' },
  { name: 'Detector de monóxido de carbono', icon: 'alert-triangle', group: 'Seguridad' },

  // -------------------------- Internet y oficina -----------------------
  { name: 'WiFi', icon: 'wifi', group: 'Internet y oficina' },
  { name: 'Zona de trabajo privada', icon: 'laptop', group: 'Internet y oficina' },

  // ------------------------- Utensilios y vajilla ----------------------
  { name: 'Cocina equipada', icon: 'chef-hat', group: 'Cocina' },
  { name: 'Refrigerador', icon: 'refrigerator', group: 'Cocina' },
  { name: 'Microondas', icon: 'microwave', group: 'Cocina' },
  { name: 'Platos y cubiertos', icon: 'utensils', group: 'Cocina' },
  { name: 'Cocina a gas', icon: 'flame', group: 'Cocina' },
  { name: 'Hervidor de agua', icon: 'cup-soda', group: 'Cocina' },
  { name: 'Cafetera', icon: 'coffee', group: 'Cocina' },
  { name: 'Café', icon: 'coffee', group: 'Cocina' },
  { name: 'Copas de vino', icon: 'wine', group: 'Cocina' },
  { name: 'Licuadora', icon: 'blend', group: 'Cocina' },
  { name: 'Arrocera', icon: 'cooking-pot', group: 'Cocina' },
  { name: 'Mesa de comedor', icon: 'armchair', group: 'Cocina' },

  // --------------------- Estacionamiento e instalaciones ---------------
  { name: 'Estacionamiento techado gratuito', icon: 'circle-parking', group: 'Estacionamiento' },
  { name: 'Ascensor', icon: 'arrow-up-down', group: 'Estacionamiento' },

  // ------------------------------ Servicios ----------------------------
  { name: 'Apto para mascotas', icon: 'paw-print', group: 'Servicios' },
  { name: 'Se permite dejar el equipaje', icon: 'luggage', group: 'Servicios' },

  // --------------------------- Climatización ---------------------------
  { name: 'Aire acondicionado', icon: 'air-vent', group: 'Climatización' },
  { name: 'Calefacción', icon: 'thermometer-sun', group: 'Climatización' },
];

async function main() {
  console.log(`Sincronizando ${AMENITIES.length} amenidades…`);

  let creadas = 0;
  let actualizadas = 0;

  for (const amenity of AMENITIES) {
    const slug = slugify(amenity.name, { lower: true, strict: true });
    const existing = await prisma.amenity.findUnique({ where: { slug } });

    await prisma.amenity.upsert({
      where: { slug },
      // Sólo se refresca icono y grupo: el nombre podría haberse editado a mano.
      update: { icon: amenity.icon, group: amenity.group, isActive: true },
      create: { name: amenity.name, slug, icon: amenity.icon, group: amenity.group },
    });

    if (existing) actualizadas += 1;
    else creadas += 1;
  }

  const total = await prisma.amenity.count({ where: { isActive: true } });
  console.log(`   ✓ ${creadas} nuevas, ${actualizadas} actualizadas`);
  console.log(`   ✓ ${total} amenidades activas en el catálogo`);
}

main()
  .catch((error) => {
    console.error('Error sincronizando amenidades:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
