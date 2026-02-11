interface PageRef {
  page_key: string;
  slug: string;
  parent_page_key: string | null;
  title?: string;
}

/**
 * Builds the full URL path for a page by walking up the parent chain.
 * E.g., if page C has parent B, and B has parent A:
 *   buildFullPath(C, allPages) => "/a-slug/b-slug/c-slug"
 */
export function buildFullPath(page: PageRef, allPages: PageRef[]): string {
  const segments: string[] = [page.slug];
  let currentParentKey = page.parent_page_key;
  const visited = new Set<string>();

  while (currentParentKey) {
    if (visited.has(currentParentKey)) break; // prevent infinite loops
    visited.add(currentParentKey);
    const parent = allPages.find((p) => p.page_key === currentParentKey);
    if (!parent) break;
    segments.unshift(parent.slug);
    currentParentKey = parent.parent_page_key;
  }

  return '/' + segments.join('/');
}

/**
 * Given URL segments (e.g., ["category", "parent", "my-page"]),
 * finds the matching page by verifying the full parent chain.
 */
export function resolvePageByPath(
  segments: string[],
  allPages: PageRef[]
): PageRef | null {
  const targetSlug = segments[segments.length - 1];
  const candidates = allPages.filter((p) => p.slug === targetSlug);

  for (const candidate of candidates) {
    const fullPath = buildFullPath(candidate, allPages);
    if (fullPath === '/' + segments.join('/')) {
      return candidate;
    }
  }

  return null;
}

/**
 * Checks if setting parentKey as parent of pageKey would create a circular reference.
 */
export function wouldCreateCycle(
  pageKey: string,
  parentKey: string,
  allPages: PageRef[]
): boolean {
  let currentKey: string | null = parentKey;
  const visited = new Set<string>();

  while (currentKey) {
    if (currentKey === pageKey) return true;
    if (visited.has(currentKey)) return false;
    visited.add(currentKey);
    const parent = allPages.find((p) => p.page_key === currentKey);
    currentKey = parent?.parent_page_key || null;
  }

  return false;
}
