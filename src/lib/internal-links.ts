import type { InternalLinkRule } from '@/types/database';

/**
 * Apply internal linking rules to HTML content.
 * For each active rule, replaces up to `max_occurrences` of the keyword
 * with a link to the target page.
 * @param pageKeyToSlug - Mapping of page_key to slug for URL resolution
 */
export function applyInternalLinks(
  html: string,
  rules: InternalLinkRule[],
  baseUrl: string,
  pageKeyToSlug: Record<string, string> = {}
): string {
  if (!html || !rules.length) return html;

  let result = html;
  const activeRules = rules.filter((r) => r.is_active);

  for (const rule of activeRules) {
    // Resolve slug from page_key, fallback to page_key if not found
    const targetSlug = pageKeyToSlug[rule.target_page_key] || rule.target_page_key;
    const keyword = escapeRegex(rule.keyword);
    // Only match keywords outside of HTML tags and existing links
    const regex = new RegExp(
      `(?<![<\\/a-zA-Z"'=])\\b(${keyword})\\b(?![^<]*<\\/a>)(?![^<]*>)`,
      'gi'
    );

    let count = 0;
    result = result.replace(regex, (match) => {
      if (count >= rule.max_occurrences) return match;
      count++;
      return `<a href="${baseUrl}/${targetSlug}" class="internal-link">${match}</a>`;
    });
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count words in a text string (strips HTML tags first).
 */
export function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, '').trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).length;
}
