/**
 * Integration tests for the CMS page rendering pipeline.
 * Tests the full flow from content input to sanitized HTML output.
 * @jest-environment node
 */
import { sanitizeHTMLServer } from '@/lib/sanitize';
import { applyInternalLinks, countWords } from '@/lib/internal-links';
import { slugify } from '@/lib/utils';
import type { InternalLinkRule } from '@/types/database';

describe('Page Rendering Pipeline Integration', () => {
  const baseUrl = 'https://example.com';

  it('processes content through the full pipeline: links + sanitization', () => {
    const rules: InternalLinkRule[] = [
      {
        id: '1',
        keyword: 'CMS',
        target_page_key: 'cms-info',
        max_occurrences: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    const content = '<div class="bg-blue-500 p-8"><h2 class="text-3xl font-bold">Our CMS Platform</h2><p>Learn about our CMS system today.</p></div>';

    // Step 1: Apply internal links
    const withLinks = applyInternalLinks(content, rules, baseUrl);
    expect(withLinks).toContain('<a href="https://example.com/cms-info"');

    // Step 2: Sanitize
    const sanitized = sanitizeHTMLServer(withLinks);
    expect(sanitized).toContain('class="bg-blue-500 p-8"');
    expect(sanitized).toContain('<a href="https://example.com/cms-info"');
    expect(sanitized).not.toContain('<script');
  });

  it('sanitizes malicious content while preserving Tailwind classes', () => {
    const maliciousContent = `
      <div class="bg-red-500 text-white p-4">
        <h1 class="text-2xl font-bold" onclick="alert('xss')">Title</h1>
        <script>document.cookie</script>
        <p>Safe content</p>
        <a href="javascript:alert(1)">Bad link</a>
        <img src="valid.jpg" onerror="alert(1)" class="rounded-xl" />
      </div>
    `;

    const sanitized = sanitizeHTMLServer(maliciousContent);
    // Tailwind classes preserved
    expect(sanitized).toContain('class="bg-red-500 text-white p-4"');
    expect(sanitized).toContain('class="text-2xl font-bold"');
    expect(sanitized).toContain('class="rounded-xl"');
    // XSS removed
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).not.toContain('onerror');
  });

  it('generates slugs from page keys correctly', () => {
    const testCases = [
      { input: 'Notre Page de Contact', expected: 'notre-page-de-contact' },
      { input: 'Café & Résumé', expected: 'cafe-resume' },
      { input: 'SEO CMS — 2024', expected: 'seo-cms-2024' },
      { input: 'Page Produit #1', expected: 'page-produit-1' },
    ];

    for (const { input, expected } of testCases) {
      expect(slugify(input)).toBe(expected);
    }
  });

  it('counts words correctly after sanitization', () => {
    const content = '<div class="p-4"><h2>Title Here</h2> <p>Some paragraph with <strong>bold</strong> text.</p></div>';
    const sanitized = sanitizeHTMLServer(content);
    expect(countWords(sanitized)).toBe(7);
  });

  it('handles complex template section content', () => {
    const heroSection = `
      <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-8 text-center rounded-2xl">
        <h1 class="text-4xl font-bold mb-4">Titre Principal</h1>
        <p class="text-xl opacity-90 max-w-2xl mx-auto">Description accrocheur</p>
        <a href="#contact" class="inline-block mt-8 px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl">Commencer</a>
      </div>
    `;
    const faqSection = `
      <div class="space-y-4">
        <details class="border border-gray-200 rounded-xl p-4">
          <summary class="font-semibold cursor-pointer">Question ?</summary>
          <p class="mt-2 text-gray-600">Réponse.</p>
        </details>
      </div>
    `;

    const sanitizedHero = sanitizeHTMLServer(heroSection);
    const sanitizedFaq = sanitizeHTMLServer(faqSection);

    // All Tailwind classes should be preserved
    expect(sanitizedHero).toContain('bg-gradient-to-r');
    expect(sanitizedHero).toContain('from-blue-600');
    expect(sanitizedHero).toContain('rounded-2xl');
    expect(sanitizedFaq).toContain('border-gray-200');
    expect(sanitizedFaq).toContain('rounded-xl');
    // HTML structure preserved
    expect(sanitizedFaq).toContain('<details');
    expect(sanitizedFaq).toContain('<summary');
  });

  it('handles empty/null content gracefully', () => {
    expect(sanitizeHTMLServer('')).toBe('');
    expect(applyInternalLinks('', [], baseUrl)).toBe('');
    expect(countWords('')).toBe(0);
  });

  it('preserves form elements through sanitization', () => {
    const formContent = `
      <form class="space-y-4">
        <input type="text" placeholder="Nom" class="w-full px-4 py-3 border border-gray-300 rounded-xl" />
        <textarea placeholder="Message" rows="4" class="w-full px-4 py-3 rounded-xl"></textarea>
        <button type="submit" class="w-full py-3 bg-gray-900 text-white rounded-xl">Envoyer</button>
      </form>
    `;
    const sanitized = sanitizeHTMLServer(formContent);
    expect(sanitized).toContain('<form');
    expect(sanitized).toContain('<input');
    expect(sanitized).toContain('<textarea');
    expect(sanitized).toContain('<button');
    expect(sanitized).toContain('rounded-xl');
  });

  it('handles internal links with special characters in keywords', () => {
    const rules: InternalLinkRule[] = [
      {
        id: '1',
        keyword: 'C++ development',
        target_page_key: 'cpp-dev',
        max_occurrences: 1,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
    const content = '<p>We offer C++ development services.</p>';
    const result = applyInternalLinks(content, rules, baseUrl);
    expect(result).toContain('cpp-dev');
  });
});
