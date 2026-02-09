import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  if (typeof window === 'undefined') return dirty;
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'figure', 'figcaption', 'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon'],
    ADD_ATTR: ['target', 'rel', 'allowfullscreen', 'frameborder', 'class', 'style', 'id', 'role', 'aria-label', 'aria-hidden', 'data-*', 'viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'xmlns'],
  });
}

/**
 * Sanitize HTML for server-side rendering (no DOMPurify dependency on window).
 * Strips dangerous elements and attributes while preserving Tailwind classes.
 */
export function sanitizeHTMLServer(dirty: string): string {
  // Remove script tags and their content
  let clean = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove event handler attributes (onclick, onload, onerror, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  // Remove javascript: protocol from href, src, action, etc.
  clean = clean.replace(/(href|src|action|formaction|data|poster)\s*=\s*(?:"[^"]*javascript\s*:[^"]*"|'[^']*javascript\s*:[^']*')/gi, '$1=""');
  // Remove data: URIs that could contain HTML/scripts (allow data:image)
  clean = clean.replace(/(href|src|action|formaction)\s*=\s*(?:"data:(?!image\/)[^"]*"|'data:(?!image\/)[^']*')/gi, '$1=""');
  // Remove <object>, <embed>, <applet> tags
  clean = clean.replace(/<(?:object|embed|applet)\b[^>]*>[\s\S]*?<\/(?:object|embed|applet)>/gi, '');
  clean = clean.replace(/<(?:object|embed|applet)\b[^>]*\/?>/gi, '');
  // Remove <base> tags
  clean = clean.replace(/<base\b[^>]*\/?>/gi, '');
  return clean;
}
