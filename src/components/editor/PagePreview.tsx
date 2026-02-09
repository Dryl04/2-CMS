'use client';

import { sanitizeHTML } from '@/lib/sanitize';
import type { SEOMetadata, SectionContent, TemplateSection } from '@/types/database';

interface PagePreviewProps {
  page: Partial<SEOMetadata>;
  sections?: TemplateSection[];
  sectionContents?: SectionContent[];
}

export default function PagePreview({ page, sections, sectionContents }: PagePreviewProps) {
  const getSectionContent = (sectionId: string) => {
    return sectionContents?.find((sc) => sc.section_id === sectionId)?.content || '';
  };

  const hasCustomHTML = (html: string): boolean => {
    return /<(?:div|section|article|header|footer|nav|aside|main|figure|span)[^>]*class=/i.test(html);
  };

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

      {/* Page content */}
      <div className="preview-container">
        {page.h1 && (
          <div className="max-w-3xl mx-auto px-8 pt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.h1}</h1>
          </div>
        )}
        {page.h2 && (
          <div className="max-w-3xl mx-auto px-8">
            <h2 className="text-xl text-gray-600 mb-6">{page.h2}</h2>
          </div>
        )}

        {/* Template sections */}
        {sections && sections.length > 0 ? (
          <div>
            {sections.map((section) => {
              const html = getSectionContent(section.id);
              if (!html) return null;
              const sanitized = sanitizeHTML(html);
              const isCustom = hasCustomHTML(html);
              return (
                <div key={section.id}>
                  {isCustom ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitized }} />
                  ) : (
                    <div className="max-w-3xl mx-auto px-8 py-4">
                      <div
                        className="prose prose-gray max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitized }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Fallback: raw content
          page.content && (() => {
            const sanitized = sanitizeHTML(page.content);
            const isCustom = hasCustomHTML(page.content);
            return isCustom ? (
              <div dangerouslySetInnerHTML={{ __html: sanitized }} />
            ) : (
              <div className="max-w-3xl mx-auto p-8">
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitized }}
                />
              </div>
            );
          })()
        )}

        {!page.h1 && !page.content && (!sections || sections.length === 0) && (
          <p className="text-gray-400 text-center py-12">Aucun contenu à prévisualiser</p>
        )}
      </div>
    </div>
  );
}
