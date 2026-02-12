# Scheduled Publication Setup

## Overview
The scheduled publication feature automatically publishes pending pages based on the publication configuration (pages per day).

## Components
1. **Edge Function**: `supabase/functions/scheduled-publication/index.ts`
2. **Database Table**: `publication_config` (stores settings)
3. **Publication Manager UI**: `/admin/publication` (manual control + config)

## Setup Instructions

### Option 1: Using pg_cron (Supabase Built-in)

1. Enable the `pg_cron` extension in your Supabase project:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

2. Create a cron job to call the edge function daily:
```sql
SELECT cron.schedule(
  'publish-pages-daily',
  '0 10 * * *',  -- Run daily at 10:00 AM UTC
  $$
  SELECT
    net.http_post(
      url := '<YOUR_SUPABASE_URL>/functions/v1/scheduled-publication',
      headers := jsonb_build_object(
        'Authorization', 'Bearer <YOUR_ANON_KEY>',
        'Content-Type', 'application/json'
      )
    );
  $$
);
```

Replace `<YOUR_SUPABASE_URL>` and `<YOUR_ANON_KEY>` with your actual values.

### Option 2: Using External Cron Service

Use a service like:
- **GitHub Actions** (free, runs on schedule)
- **Vercel Cron Jobs**
- **EasyCron**
- **cron-job.org**

Example GitHub Actions workflow (`.github/workflows/publish.yml`):

```yaml
name: Scheduled Publication

on:
  schedule:
    - cron: '0 10 * * *'  # Daily at 10:00 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Call Publication Edge Function
        run: |
          curl -X POST \
            ${{ secrets.SUPABASE_URL }}/functions/v1/scheduled-publication \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

### Option 3: Using Supabase CLI (Development/Testing)

```bash
# Deploy the function
supabase functions deploy scheduled-publication

# Test the function
supabase functions invoke scheduled-publication
```

## How It Works

1. The edge function checks if publication is active in `publication_config`
2. It verifies if 24 hours have passed since the last run
3. It fetches `pages_per_day` pages with `status = 'pending'`
4. Pages are ordered by `scheduled_at` (if set), then `created_at`
5. Selected pages are updated to `status = 'published'`
6. The `last_run_at` timestamp is updated

## Configuration

Set your publication schedule in the admin panel at `/admin/publication`:

- **Pages per day**: Number of pages to publish each day
- **Active/Inactive**: Toggle to enable/disable automatic publication

## Manual Publication

You can also manually publish pages:
1. Go to `/admin/publication`
2. Click "Publier maintenant" to publish the next batch immediately
3. This respects the "pages per day" limit but ignores the 24-hour wait

## Monitoring

Check the edge function logs in your Supabase dashboard:
1. Go to **Functions** → **scheduled-publication**
2. View the **Logs** tab for execution history and errors

## Troubleshooting

**Function not running:**
- Check that pg_cron extension is enabled
- Verify the cron schedule is correct
- Check edge function logs for errors

**Pages not publishing:**
- Verify `is_active = true` in `publication_config`
- Check that pages have `status = 'pending'`
- Ensure 24 hours have passed since last run

**Database permissions:**
- The edge function uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- Make sure this environment variable is set in your Supabase project
