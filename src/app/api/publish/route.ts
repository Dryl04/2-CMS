import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint is called by a cron job to auto-publish pending pages
// It uses the service role key for server-side operations
export async function POST(request: NextRequest) {
  try {
    // Verify authorization header (simple bearer token or cron secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get publication config
    const { data: config } = await supabase
      .from('publication_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!config) {
      return NextResponse.json({
        message: 'Publication is not active',
        published: 0,
      });
    }

    // Get pending pages (ordered by creation date = FIFO queue)
    const { data: pendingPages, error: fetchError } = await supabase
      .from('seo_metadata')
      .select('id')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(config.pages_per_day);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!pendingPages || pendingPages.length === 0) {
      // Update last_run_at even if nothing to publish
      await supabase
        .from('publication_config')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', config.id);

      return NextResponse.json({
        message: 'No pending pages to publish',
        published: 0,
      });
    }

    // Publish pages
    const ids = pendingPages.map((p) => p.id);
    const now = new Date().toISOString();

    const { error: updateError, count } = await supabase
      .from('seo_metadata')
      .update({
        status: 'published',
        published_at: now,
        updated_at: now,
      })
      .in('id', ids);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update last_run_at
    await supabase
      .from('publication_config')
      .update({ last_run_at: now })
      .eq('id', config.id);

    return NextResponse.json({
      message: `Published ${count || ids.length} page(s)`,
      published: count || ids.length,
      publishedAt: now,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
