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
 * Allows Tailwind classes and standard HTML attributes.
 */
export function sanitizeHTMLServer(dirty: string): string {
  // On server, we do basic sanitization by stripping script tags and event handlers
  return dirty
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\bon\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript\s*:/gi, '');
}
