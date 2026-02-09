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
      <div className="p-8 max-w-3xl mx-auto">
        {page.h1 && (
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{page.h1}</h1>
        )}
        {page.h2 && (
          <h2 className="text-xl text-gray-600 mb-6">{page.h2}</h2>
        )}

        {/* Template sections */}
        {sections && sections.length > 0 ? (
          <div className="space-y-6">
            {sections.map((section) => {
              const html = getSectionContent(section.id);
              if (!html) return null;
              return (
                <div key={section.id}>
                  <div
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          // Fallback: raw content
          page.content && (
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(page.content) }}
            />
          )
        )}

        {!page.h1 && !page.content && (!sections || sections.length === 0) && (
          <p className="text-gray-400 text-center py-12">Aucun contenu à prévisualiser</p>
        )}
      </div>
    </div>
  );
}
