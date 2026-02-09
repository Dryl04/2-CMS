/**
 * @jest-environment node
 */
import { sanitizeHTMLServer } from '@/lib/sanitize';

describe('sanitizeHTMLServer', () => {
  it('removes script tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHTMLServer(input)).toBe('<p>Hello</p>');
  });

  it('removes noscript tags', () => {
    const input = '<p>Hello</p><noscript><img src="x" onerror="alert(1)"></noscript>';
    expect(sanitizeHTMLServer(input)).toBe('<p>Hello</p>');
  });

  it('removes event handler attributes', () => {
    const input = '<div onclick="alert(1)" class="test">Content</div>';
    expect(sanitizeHTMLServer(input)).toBe('<div class="test">Content</div>');
  });

  it('removes javascript: protocols from href', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHTMLServer(input);
    expect(result).not.toContain('javascript:');
  });

  it('removes data: URIs except images', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
    const result = sanitizeHTMLServer(input);
    expect(result).not.toContain('data:text');
  });

  it('preserves data:image URIs', () => {
    const input = '<img src="data:image/png;base64,abc123" />';
    expect(sanitizeHTMLServer(input)).toContain('data:image/png');
  });

  it('removes object/embed/applet tags', () => {
    const input = '<object data="file.swf"></object><embed src="file.swf"><applet>test</applet>';
    const result = sanitizeHTMLServer(input);
    expect(result).not.toContain('<object');
    expect(result).not.toContain('<embed');
    expect(result).not.toContain('<applet');
  });

  it('removes base tags', () => {
    const input = '<base href="http://evil.com"><p>Test</p>';
    expect(sanitizeHTMLServer(input)).toBe('<p>Test</p>');
  });

  it('removes meta tags with http-equiv', () => {
    const input = '<meta http-equiv="refresh" content="0;url=evil.com"><p>Test</p>';
    expect(sanitizeHTMLServer(input)).toBe('<p>Test</p>');
  });

  it('preserves safe HTML with Tailwind classes', () => {
    const input = '<div class="bg-blue-500 text-white p-8"><h2 class="text-3xl font-bold">Title</h2></div>';
    expect(sanitizeHTMLServer(input)).toBe(input);
  });

  it('preserves section/article/nav/aside/header/footer tags', () => {
    const input = '<section class="py-8"><article><header>H</header><nav>N</nav><aside>A</aside><footer>F</footer></article></section>';
    expect(sanitizeHTMLServer(input)).toBe(input);
  });

  it('preserves details/summary tags', () => {
    const input = '<details open><summary>FAQ</summary><p>Answer</p></details>';
    expect(sanitizeHTMLServer(input)).toBe(input);
  });

  it('preserves form elements', () => {
    const input = '<form><input type="text" placeholder="Name"><textarea rows="4"></textarea><button type="submit">Send</button></form>';
    expect(sanitizeHTMLServer(input)).toBe(input);
  });

  it('preserves video/audio tags', () => {
    const input = '<video controls><source src="video.mp4" type="video/mp4"></video>';
    expect(sanitizeHTMLServer(input)).toBe(input);
  });

  it('preserves table elements', () => {
    const input = '<table class="w-full"><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
    expect(sanitizeHTMLServer(input)).toBe(input);
  });

  it('removes multiple event handlers', () => {
    const input = '<img src="x.jpg" onerror="alert(1)" onload="alert(2)" class="rounded" />';
    const result = sanitizeHTMLServer(input);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('onload');
    expect(result).toContain('class="rounded"');
  });
});
