import { nightsBetween, rangesOverlap, toUtcDate } from './date.util';

describe('date.util', () => {
  it('cuenta correctamente las noches entre dos fechas', () => {
    expect(nightsBetween(new Date('2026-09-10'), new Date('2026-09-14'))).toBe(4);
    expect(nightsBetween(new Date('2026-12-30'), new Date('2027-01-02'))).toBe(3);
  });

  it('normaliza a medianoche UTC', () => {
    expect(toUtcDate('2026-09-10T18:45:00Z').toISOString()).toBe('2026-09-10T00:00:00.000Z');
  });

  describe('rangesOverlap', () => {
    const a = [new Date('2026-09-10'), new Date('2026-09-14')] as const;

    it('detecta solapamiento parcial', () => {
      expect(rangesOverlap(...a, new Date('2026-09-12'), new Date('2026-09-16'))).toBe(true);
    });

    it('permite check-in el mismo día del check-out anterior', () => {
      expect(rangesOverlap(...a, new Date('2026-09-14'), new Date('2026-09-18'))).toBe(false);
    });

    it('detecta un rango contenido', () => {
      expect(rangesOverlap(...a, new Date('2026-09-11'), new Date('2026-09-12'))).toBe(true);
    });
  });
});
