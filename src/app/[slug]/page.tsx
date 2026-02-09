import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient as createServerClient } from '@/lib/supabase-server';
import { sanitizeHTML } from '@/lib/sanitize';
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

  // Load page data
  const { data: page, error } = await supabase
    .from('seo_metadata')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
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

  // Process content with internal links
  const processContent = (html: string): string => {
    let processed = html;
    if (linkRules && linkRules.length > 0) {
      processed = applyInternalLinks(processed, linkRules, siteUrl);
    }
    return sanitizeHTML(processed);
  };

  // Build page HTML
  const sectionContents = (page.sections_content as SectionContent[]) || [];

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {page.h1 && (
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.h1}</h1>
          )}
          {page.h2 && (
            <h2 className="text-xl text-gray-600 mb-8">{page.h2}</h2>
          )}

          {/* Template-based sections */}
          {templateSections.length > 0 ? (
            <div className="space-y-8">
              {templateSections.map((section) => {
                const content = sectionContents.find((sc) => sc.section_id === section.id);
                if (!content?.content) return null;
                return (
                  <section key={section.id}>
                    <div
                      className="prose prose-lg prose-gray max-w-none"
                      dangerouslySetInnerHTML={{ __html: processContent(content.content) }}
                    />
                  </section>
                );
              })}
            </div>
          ) : page.content ? (
            <div
              className="prose prose-lg prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: processContent(page.content) }}
            />
          ) : null}
        </article>
      </main>
      <PublicFooter />
    </>
  );
}
