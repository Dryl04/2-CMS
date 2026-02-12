/*
  # Création du système de redirections 301
  
  1. Table redirects pour gérer les anciennes URLs
  2. Support des redirections temporaires (302) et permanentes (301)
  3. Tracking des utilisations
*/

CREATE TABLE IF NOT EXISTS redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL UNIQUE,
  destination_path text NOT NULL,
  redirect_type integer DEFAULT 301 CHECK (redirect_type IN (301, 302)),
  is_active boolean DEFAULT true,
  hit_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_redirects_source_path ON redirects(source_path) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_redirects_active ON redirects(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Public can read active redirects (for middleware)
CREATE POLICY "Public peut lire redirects actives"
  ON redirects FOR SELECT
  USING (is_active = true);

-- Authenticated can read all redirects
CREATE POLICY "Authenticated peut lire toutes redirects"
  ON redirects FOR SELECT
  TO authenticated
  USING (true);

-- Admin/SEO can create redirects
CREATE POLICY "Admin/SEO peut créer redirects"
  ON redirects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'seo')
    )
  );

-- Admin/SEO can update redirects
CREATE POLICY "Admin/SEO peut modifier redirects"
  ON redirects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'seo')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'seo')
    )
  );

-- Admin/SEO can delete redirects
CREATE POLICY "Admin/SEO peut supprimer redirects"
  ON redirects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'seo')
    )
  );

-- Function to auto-create redirect when a slug changes
CREATE OR REPLACE FUNCTION auto_create_redirect()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create redirect if slug changed and page is published
  IF OLD.slug IS DISTINCT FROM NEW.slug AND NEW.status = 'published' THEN
    -- Insert redirect from old slug to new slug
    INSERT INTO redirects (source_path, destination_path, redirect_type, is_active)
    VALUES (OLD.slug, NEW.slug, 301, true)
    ON CONFLICT (source_path) DO UPDATE
    SET destination_path = EXCLUDED.destination_path,
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to automatically create redirects on slug changes
DROP TRIGGER IF EXISTS trigger_auto_create_redirect ON seo_metadata;
CREATE TRIGGER trigger_auto_create_redirect
  AFTER UPDATE OF slug ON seo_metadata
  FOR EACH ROW
  WHEN (OLD.slug IS DISTINCT FROM NEW.slug)
  EXECUTE FUNCTION auto_create_redirect();

-- Comments for documentation
COMMENT ON TABLE redirects IS 'Redirections 301/302 pour gérer les changements d''URL';
COMMENT ON COLUMN redirects.source_path IS 'Ancien chemin (slug) à rediriger';
COMMENT ON COLUMN redirects.destination_path IS 'Nouveau chemin (slug) de destination';
COMMENT ON COLUMN redirects.redirect_type IS 'Type de redirection: 301 (permanent) ou 302 (temporaire)';
COMMENT ON COLUMN redirects.hit_count IS 'Nombre de fois que la redirection a été utilisée';

-- Function to atomically increment hit count (race-condition safe)
CREATE OR REPLACE FUNCTION increment_redirect_hit_count(redirect_source_path text)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE redirects
  SET hit_count = hit_count + 1
  WHERE source_path = redirect_source_path AND is_active = true;
$$;

GRANT EXECUTE ON FUNCTION increment_redirect_hit_count(text) TO anon, authenticated;
