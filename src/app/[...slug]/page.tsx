import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { createClient as createServerClient } from '@/lib/supabase-server';
import { sanitizeHTMLServer } from '@/lib/sanitize';
import { applyInternalLinks } from '@/lib/internal-links';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import type { SectionContent, TemplateSection } from '@/types/database';

// Force dynamic rendering to avoid stale 404 caches
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

/**
 * Find a page by its complete slug path.
 * The slug field now stores the complete URL path (e.g., "blog/tech/article")
 */
async function findPageBySlugPath(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  slugSegments: string[],
  filters?: { status?: string; is_public?: boolean }
) {
  // Join slug segments to create the complete path
  const fullSlugPath = slugSegments.join('/');

  // Query directly by the complete slug
  let query = supabase
    .from('seo_metadata')
    .select('*')
    .eq('slug', fullSlugPath);

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public);

  const { data } = await query.single();
  return data || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: slugSegments } = await params;
  const supabase = await createServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  const page = await findPageBySlugPath(supabase, slugSegments, { status: 'published' });

  if (!page) return { title: 'Page non trouvee' };

  const fullPath = slugSegments.join('/');

  return {
    title: page.title,
    description: page.meta_description,
    keywords: page.keywords?.join(', '),
    alternates: {
      canonical: page.canonical_url || `${siteUrl}/${fullPath}`,
    },
    openGraph: {
      title: page.title,
      description: page.meta_description || undefined,
      url: `${siteUrl}/${fullPath}`,
      type: 'website',
    },
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug: slugSegments } = await params;
  const supabase = await createServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  // Load page data — show published pages that are public
  const page = await findPageBySlugPath(supabase, slugSegments, {
    status: 'published',
    is_public: true,
  });

  if (!page) notFound();

  // Load all pages for internal links mapping (page_key -> slug)
  const { data: allPages } = await supabase
    .from('seo_metadata')
    .select('page_key, slug')
    .eq('status', 'published');

  const pageKeyToSlug: Record<string, string> = {};
  if (allPages) {
    for (const p of allPages) {
      pageKeyToSlug[p.page_key] = p.slug;
    }
  }

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
      processed = applyInternalLinks(processed, linkRules, siteUrl, pageKeyToSlug);
    }
    return sanitizeHTMLServer(processed);
  };

  // Check if content contains HTML tags with class attributes (custom styled HTML)
  const hasCustomHTML = (html: string): boolean => {
    return /<[a-z][a-z0-9]*[^>]*class=/i.test(html);
  };

  // Build page HTML
  const sectionContents = (page.sections_content as SectionContent[]) || [];

  return (
    <>
      {/* Load Tailwind CDN for user-generated content with arbitrary classes */}
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <PublicHeader />
      <main className="min-h-screen pt-20 public-content">
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
            {templateSections.map((section, index) => {
              const content = sectionContents.find((sc) => sc.section_id === section.id);
              if (!content?.content) return null;
              const processed = processContent(content.content);
              const isCustom = hasCustomHTML(content.content);
              return (
                <section key={section.id} className={index > 0 ? 'mt-8' : ''}>
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
