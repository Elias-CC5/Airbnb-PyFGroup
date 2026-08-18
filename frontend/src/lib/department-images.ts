/**
 * Fotos reales por departamento.
 *
 * En vez de hardcodear URLs de un banco de imágenes (que caducan y no puedo
 * verificar), se consulta el resumen de Wikipedia del lugar más representativo
 * de cada región y se usa su foto principal. Si la consulta falla o el artículo
 * no tiene imagen, se cae a un placeholder — nunca rompe la página.
 *
 * Lo definitivo es cargar `Department.imageUrl` desde el admin: ese valor
 * siempre tiene prioridad sobre esto.
 */

/** slug del departamento → artículo de Wikipedia en español con buena foto. */
const WIKI_ARTICLE: Record<string, string> = {
  amazonas: 'Catarata_del_Gocta',
  ancash: 'Huascarán',
  apurimac: 'Abancay',
  arequipa: 'Arequipa',
  ayacucho: 'Ayacucho',
  cajamarca: 'Cajamarca',
  callao: 'Callao',
  cusco: 'Machu_Picchu',
  huancavelica: 'Huancavelica',
  huanuco: 'Huánuco',
  ica: 'Huacachina',
  junin: 'Huancayo',
  'la-libertad': 'Chan_Chan',
  lambayeque: 'Chiclayo',
  lima: 'Lima',
  loreto: 'Iquitos',
  'madre-de-dios': 'Parque_nacional_del_Manu',
  moquegua: 'Moquegua',
  pasco: 'Cerro_de_Pasco',
  piura: 'Máncora',
  puno: 'Lago_Titicaca',
  'san-martin': 'Tarapoto',
  tacna: 'Tacna',
  tumbes: 'Tumbes',
  ucayali: 'Pucallpa',
};

interface WikiSummary {
  originalimage?: { source?: string };
  thumbnail?: { source?: string };
}

const placeholder = (slug: string) => `https://picsum.photos/seed/dep-${slug}/1200/800`;

/** Foto de un departamento. Nunca lanza: ante cualquier fallo devuelve placeholder. */
export async function getDepartmentImage(slug: string): Promise<string> {
  const article = WIKI_ARTICLE[slug];
  if (!article) return placeholder(slug);

  try {
    const res = await fetch(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`,
      {
        headers: { accept: 'application/json' },
        // Se revalida una vez al día: son fotos que no cambian.
        next: { revalidate: 86_400 },
      },
    );
    if (!res.ok) return placeholder(slug);

    const data = (await res.json()) as WikiSummary;
    return data.originalimage?.source ?? data.thumbnail?.source ?? placeholder(slug);
  } catch {
    return placeholder(slug);
  }
}

/** Resuelve las fotos de varios departamentos en paralelo. */
export async function getDepartmentImages(
  departments: Array<{ slug: string; imageUrl?: string | null }>,
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    departments.map(async (d) => [d.slug, d.imageUrl ?? (await getDepartmentImage(d.slug))] as const),
  );
  return Object.fromEntries(entries);
}
