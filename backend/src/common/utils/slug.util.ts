import slugify from 'slugify';

export function toSlug(value: string): string {
  return slugify(value, { lower: true, strict: true, locale: 'es', trim: true });
}

/**
 * Genera un slug único consultando un callback de existencia.
 * Ej: "casa-moderna-cusco", "casa-moderna-cusco-2", ...
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = toSlug(base);
  let candidate = root;
  let i = 1;
  while (await exists(candidate)) {
    i += 1;
    candidate = `${root}-${i}`;
  }
  return candidate;
}
