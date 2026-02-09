import { applyInternalLinks, countWords } from '@/lib/internal-links';
import type { InternalLinkRule } from '@/types/database';

describe('applyInternalLinks', () => {
  const baseUrl = 'https://example.com';

  const createRule = (overrides?: Partial<InternalLinkRule>): InternalLinkRule => ({
    id: '1',
    keyword: 'test',
    target_page_key: 'test-page',
    max_occurrences: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  });

  it('replaces keyword with a link', () => {
    const rules = [createRule({ keyword: 'SEO' })];
    const result = applyInternalLinks('<p>Learn about SEO here</p>', rules, baseUrl);
    expect(result).toContain('<a href="https://example.com/test-page"');
    expect(result).toContain('SEO</a>');
  });

  it('respects max_occurrences', () => {
    const rules = [createRule({ keyword: 'SEO', max_occurrences: 1 })];
    const result = applyInternalLinks('<p>SEO is great. SEO is important.</p>', rules, baseUrl);
    const linkCount = (result.match(/<a href/g) || []).length;
    expect(linkCount).toBe(1);
  });

  it('handles multiple rules', () => {
    const rules = [
      createRule({ id: '1', keyword: 'SEO', target_page_key: 'seo-page' }),
      createRule({ id: '2', keyword: 'CMS', target_page_key: 'cms-page' }),
    ];
    const result = applyInternalLinks('<p>Our SEO CMS platform</p>', rules, baseUrl);
    expect(result).toContain('seo-page');
    expect(result).toContain('cms-page');
  });

  it('skips inactive rules', () => {
    const rules = [createRule({ is_active: false })];
    const result = applyInternalLinks('<p>test content</p>', rules, baseUrl);
    expect(result).not.toContain('<a href');
  });

  it('returns original html when no rules', () => {
    const html = '<p>Hello World</p>';
    expect(applyInternalLinks(html, [], baseUrl)).toBe(html);
  });

  it('returns original html when html is empty', () => {
    expect(applyInternalLinks('', [createRule()], baseUrl)).toBe('');
  });
});

describe('countWords', () => {
  it('counts words in plain text', () => {
    expect(countWords('Hello World Test')).toBe(3);
  });

  it('strips HTML tags before counting', () => {
    expect(countWords('<p>Hello <strong>World</strong></p>')).toBe(2);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for HTML-only content', () => {
    expect(countWords('<br/><hr/>')).toBe(0);
  });

  it('handles multiple spaces', () => {
    expect(countWords('Hello    World')).toBe(2);
  });

  it('counts words in complex HTML', () => {
    const html = '<div class="test"><h1>Title Here</h1> <p>Some paragraph text with words</p></div>';
    expect(countWords(html)).toBe(7);
  });
});
