import { toSlug, uniqueSlug } from './slug.util';

describe('slug.util', () => {
  it('genera slugs amigables en español', () => {
    expect(toSlug('Casa Andina con vistas al Valle Sagrado')).toBe(
      'casa-andina-con-vistas-al-valle-sagrado',
    );
  });

  it('añade sufijo numérico cuando el slug ya existe', async () => {
    const taken = new Set(['casa-moderna', 'casa-moderna-2']);
    await expect(uniqueSlug('Casa Moderna', async (s) => taken.has(s))).resolves.toBe('casa-moderna-3');
  });
});
