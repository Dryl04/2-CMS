import { cn, formatDate, generateId, slugify } from '@/lib/utils';

describe('cn (class name utility)', () => {
  it('joins multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('flattens arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });
});

describe('formatDate', () => {
  it('formats a date string in French format', () => {
    const result = formatDate('2024-01-15T10:00:00Z');
    expect(result).toMatch(/15\/01\/2024/);
  });

  it('handles different date formats', () => {
    const result = formatDate('2023-12-31');
    expect(result).toMatch(/31\/12\/2023/);
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('slugify', () => {
  it('converts text to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes accents', () => {
    expect(slugify('Café Résumé')).toBe('cafe-resume');
  });

  it('replaces special characters with hyphens', () => {
    expect(slugify('Hello & World!')).toBe('hello-world');
  });

  it('removes leading and trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles French text', () => {
    expect(slugify('Création de modèle')).toBe('creation-de-modele');
  });

  it('handles multiple consecutive spaces/special chars', () => {
    expect(slugify('hello   world   test')).toBe('hello-world-test');
  });
});
