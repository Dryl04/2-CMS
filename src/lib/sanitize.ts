import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  if (typeof window === 'undefined') return dirty;
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_TAGS: [
      'iframe', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
      'figure', 'figcaption', 'svg', 'path', 'circle', 'rect', 'line', 'polyline',
      'polygon', 'details', 'summary', 'dialog', 'mark', 'time', 'meter', 'progress',
      'video', 'audio', 'source', 'picture', 'canvas', 'template', 'slot',
    ],
    ADD_ATTR: [
      'target', 'rel', 'allowfullscreen', 'frameborder', 'class', 'style', 'id',
      'role', 'aria-label', 'aria-hidden', 'aria-expanded', 'aria-controls',
      'aria-describedby', 'aria-labelledby', 'data-*', 'viewBox', 'fill', 'stroke',
      'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'xmlns',
      'open', 'datetime', 'value', 'max', 'min', 'low', 'high', 'optimum',
      'controls', 'autoplay', 'muted', 'loop', 'preload', 'poster', 'loading',
      'decoding', 'srcset', 'sizes', 'media', 'type', 'colspan', 'rowspan',
      'scope', 'headers', 'placeholder', 'rows', 'cols', 'for', 'name',
      'action', 'method', 'novalidate', 'autocomplete', 'required', 'disabled',
      'readonly', 'checked', 'selected', 'multiple', 'accept', 'pattern',
      'tabindex', 'title', 'lang', 'dir', 'hidden', 'draggable', 'spellcheck',
    ],
  });
}

/**
 * Sanitize HTML for server-side rendering (no DOMPurify dependency on window).
 * Strips dangerous elements and attributes while preserving Tailwind classes
 * and all standard HTML tags.
 */
export function sanitizeHTMLServer(dirty: string): string {
  // Remove script tags and their content
  let clean = dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove noscript tags and their content
  clean = clean.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
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
  // Remove <meta> tags with http-equiv
  clean = clean.replace(/<meta\b[^>]*http-equiv[^>]*\/?>/gi, '');
  return clean;
}
