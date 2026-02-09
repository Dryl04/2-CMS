'use client';

import { useRef, useEffect, useState } from 'react';
import { sanitizeHTML } from '@/lib/sanitize';
import type { SEOMetadata, SectionContent, TemplateSection } from '@/types/database';

interface PagePreviewProps {
  page: Partial<SEOMetadata>;
  sections?: TemplateSection[];
  sectionContents?: SectionContent[];
}

export default function PagePreview({ page, sections, sectionContents }: PagePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(400);

  const getSectionContent = (sectionId: string) => {
    return sectionContents?.find((sc) => sc.section_id === sectionId)?.content || '';
  };

  // Build the full HTML for the preview
  const buildPreviewHTML = (): string => {
    let bodyContent = '';

    if (page.h1) {
      bodyContent += `<div class="max-w-3xl mx-auto px-8 pt-8"><h1 class="text-3xl font-bold text-gray-900 mb-4">${escapeForHTML(page.h1)}</h1></div>`;
    }
    if (page.h2) {
      bodyContent += `<div class="max-w-3xl mx-auto px-8"><h2 class="text-xl text-gray-600 mb-6">${escapeForHTML(page.h2)}</h2></div>`;
    }

    if (sections && sections.length > 0) {
      sections.forEach((section, index) => {
        const html = getSectionContent(section.id);
        if (!html) return;
        const sanitized = sanitizeHTML(html);
        const spacingClass = index > 0 ? ' mt-8' : '';
        bodyContent += `<section class="${spacingClass}">${sanitized}</section>`;
      });
    } else if (page.content) {
      const sanitized = sanitizeHTML(page.content);
      bodyContent += sanitized;
    }

    if (!bodyContent.trim()) {
      bodyContent = '<p class="text-gray-400 text-center py-12">Aucun contenu à prévisualiser</p>';
    }

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; }
    img { max-width: 100%; height: auto; }
    a { color: #2563eb; text-decoration: underline; }
  </style>
</head>
<body>
  ${bodyContent}
  <script>
    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: 'preview-height', height: height }, '*');
    }
    window.addEventListener('load', sendHeight);
    new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true });
    setTimeout(sendHeight, 500);
  <\/script>
</body>
</html>`;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-height' && typeof event.data.height === 'number') {
        setIframeHeight(Math.max(200, event.data.height + 20));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(buildPreviewHTML());
        doc.close();
      }
    }
  }, [page, sections, sectionContents]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 px-3 py-1 bg-white rounded-lg text-xs text-gray-500 font-mono">
          example.com/{page.slug || 'slug-page'}
        </div>
      </div>

      {/* Page content in iframe */}
      <iframe
        ref={iframeRef}
        className="w-full border-0"
        style={{ height: `${iframeHeight}px` }}
        sandbox="allow-scripts"
        title="Aperçu de la page"
      />
    </div>
  );
}

function escapeForHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
