// Supabase Edge Function for scheduled publication
// This function should be called by a cron job (pg_cron or external scheduler)
// It publishes N pages per day based on the publication_config settings

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PublicationConfig {
  id: string;
  pages_per_day: number;
  is_active: boolean;
  last_run_at: string | null;
}

interface SEOMetadata {
  id: string;
  page_key: string;
  slug: string;
  title: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
}

Deno.serve(async (req) => {
  try {
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase credentials' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get publication config
    const { data: config, error: configError } = await supabase
      .from('publication_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: 'No publication config found', details: configError }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const typedConfig = config as PublicationConfig;

    // Check if publication is active
    if (!typedConfig.is_active) {
      return new Response(
        JSON.stringify({ message: 'Publication is not active', skipped: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if we should run today (simple daily check)
    const now = new Date();
    const lastRun = typedConfig.last_run_at ? new Date(typedConfig.last_run_at) : null;
    
    if (lastRun) {
      const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
      // Only run once per day (24 hours)
      if (hoursSinceLastRun < 24) {
        return new Response(
          JSON.stringify({
            message: 'Already ran today',
            skipped: true,
            last_run: typedConfig.last_run_at,
            hours_since_last_run: Math.round(hoursSinceLastRun * 10) / 10,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get pending pages to publish (ordered by scheduled_at, then created_at)
    const { data: pendingPages, error: pagesError } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(typedConfig.pages_per_day);

    if (pagesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending pages', details: pagesError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const typedPages = (pendingPages || []) as SEOMetadata[];

    if (typedPages.length === 0) {
      // Update last_run_at even if no pages to publish
      await supabase
        .from('publication_config')
        .update({ last_run_at: now.toISOString() })
        .eq('id', typedConfig.id);

      return new Response(
        JSON.stringify({ message: 'No pending pages to publish', published: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Publish the pages
    const pageIds = typedPages.map((p) => p.id);
    const { error: updateError } = await supabase
      .from('seo_metadata')
      .update({
        status: 'published',
        published_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .in('id', pageIds);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to publish pages', details: updateError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update last_run_at
    await supabase
      .from('publication_config')
      .update({ last_run_at: now.toISOString() })
      .eq('id', typedConfig.id);

    return new Response(
      JSON.stringify({
        message: 'Pages published successfully',
        published: typedPages.length,
        pages: typedPages.map((p) => ({
          page_key: p.page_key,
          slug: p.slug,
          title: p.title,
        })),
        next_run: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
