import type { InternalLinkRule } from '@/types/database';

/**
 * Apply internal linking rules to HTML content.
 * For each active rule, replaces up to `max_occurrences` of the keyword
 * with a link to the target page.
 */
export function applyInternalLinks(
  html: string,
  rules: InternalLinkRule[],
  baseUrl: string
): string {
  if (!html || !rules.length) return html;

  let result = html;
  const activeRules = rules.filter((r) => r.is_active);

  for (const rule of activeRules) {
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
      return `<a href="${baseUrl}/${rule.target_page_key}" class="internal-link">${match}</a>`;
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
