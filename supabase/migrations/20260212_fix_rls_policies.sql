-- Fix RLS policies for production security
-- Remove permissive policies and add proper authentication checks

-- Drop the overly permissive policies on seo_metadata
DROP POLICY IF EXISTS "Tout le monde peut lire les métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut créer des métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut mettre à jour les métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut supprimer les métadonnées" ON seo_metadata;

-- Add secure policies for seo_metadata
-- Public can read published pages
CREATE POLICY "Public peut lire les pages publiées"
  ON seo_metadata
  FOR SELECT
  USING (status = 'published' AND is_public = true);

-- Authenticated users can read all pages
CREATE POLICY "Authentifié peut lire toutes les pages"
  ON seo_metadata
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create pages
CREATE POLICY "Authentifié peut créer des pages"
  ON seo_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update pages
CREATE POLICY "Authentifié peut modifier des pages"
  ON seo_metadata
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete pages
CREATE POLICY "Authentifié peut supprimer des pages"
  ON seo_metadata
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled on all critical tables
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_links_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_config ENABLE ROW LEVEL SECURITY;

-- Verify policies for page_templates are secure (already in COMPLETE_MIGRATIONS.sql)
-- Verify policies for internal_links_rules are secure (already in COMPLETE_MIGRATIONS.sql)
-- Verify policies for publication_config are secure (already in COMPLETE_MIGRATIONS.sql)
