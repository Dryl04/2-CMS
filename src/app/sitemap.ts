import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  if (!supabaseUrl || !supabaseAnonKey) return [];

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: pages, error } = await supabase
    .from('seo_metadata')
    .select('slug, updated_at')
    .eq('status', 'published')
    .eq('exclude_from_sitemap', false)
    .order('slug');

  if (error || !pages) return [];

  return pages.map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: page.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}
