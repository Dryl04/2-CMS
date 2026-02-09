import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient as createServerClient } from '@/lib/supabase-server';
import { sanitizeHTMLServer } from '@/lib/sanitize';
import { applyInternalLinks } from '@/lib/internal-links';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import type { SectionContent, TemplateSection } from '@/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  const { data: page } = await supabase
    .from('seo_metadata')
    .select('title, meta_description, keywords, canonical_url, slug, h1')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!page) return { title: 'Page non trouvée' };

  return {
    title: page.title,
    description: page.meta_description,
    keywords: page.keywords?.join(', '),
    alternates: {
      canonical: page.canonical_url || `${siteUrl}/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.meta_description || undefined,
      url: `${siteUrl}/${page.slug}`,
      type: 'website',
    },
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  // Load page data — show published pages or pages marked as public
  const { data: page, error } = await supabase
    .from('seo_metadata')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .neq('is_public', false)
    .single();

  if (!page || error) notFound();

  // Load internal link rules
  const { data: linkRules } = await supabase
    .from('internal_links_rules')
    .select('*')
    .eq('is_active', true);

  // Load template if applicable
  let templateSections: TemplateSection[] = [];
  if (page.template_id) {
    const { data: template } = await supabase
      .from('page_templates')
      .select('sections')
      .eq('id', page.template_id)
      .single();
    if (template) {
      templateSections = template.sections as TemplateSection[];
    }
  }

  // Process content with internal links - server-safe sanitization
  const processContent = (html: string): string => {
    let processed = html;
    if (linkRules && linkRules.length > 0) {
      processed = applyInternalLinks(processed, linkRules, siteUrl);
    }
    return sanitizeHTMLServer(processed);
  };

  // Check if content contains HTML tags (beyond basic prose tags)
  const hasCustomHTML = (html: string): boolean => {
    return /<(?:div|section|article|header|footer|nav|aside|main|figure|span)[^>]*class=/i.test(html);
  };

  // Build page HTML
  const sectionContents = (page.sections_content as SectionContent[]) || [];

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen">
        {/* If content uses custom HTML/Tailwind classes, render without prose wrapper */}
        {templateSections.length > 0 ? (
          <>
            {(page.h1 || page.h2) && (
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                {page.h1 && (
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.h1}</h1>
                )}
                {page.h2 && (
                  <h2 className="text-xl text-gray-600 mb-8">{page.h2}</h2>
                )}
              </div>
            )}
            {templateSections.map((section) => {
              const content = sectionContents.find((sc) => sc.section_id === section.id);
              if (!content?.content) return null;
              const processed = processContent(content.content);
              const isCustom = hasCustomHTML(content.content);
              return (
                <section key={section.id}>
                  {isCustom ? (
                    <div dangerouslySetInnerHTML={{ __html: processed }} />
                  ) : (
                    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                      <div
                        className="prose prose-lg prose-gray max-w-none"
                        dangerouslySetInnerHTML={{ __html: processed }}
                      />
                    </article>
                  )}
                </section>
              );
            })}
          </>
        ) : page.content ? (
          (() => {
            const processed = processContent(page.content);
            const isCustom = hasCustomHTML(page.content);
            return (
              <>
                {isCustom ? (
                  <>
                    {(page.h1 || page.h2) && (
                      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                        {page.h1 && (
                          <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.h1}</h1>
                        )}
                        {page.h2 && (
                          <h2 className="text-xl text-gray-600 mb-8">{page.h2}</h2>
                        )}
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: processed }} />
                  </>
                ) : (
                  <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {page.h1 && (
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.h1}</h1>
                    )}
                    {page.h2 && (
                      <h2 className="text-xl text-gray-600 mb-8">{page.h2}</h2>
                    )}
                    <div
                      className="prose prose-lg prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: processed }}
                    />
                  </article>
                )}
              </>
            );
          })()
        ) : (
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {page.h1 && (
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.h1}</h1>
            )}
            {page.h2 && (
              <h2 className="text-xl text-gray-600 mb-8">{page.h2}</h2>
            )}
          </article>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
