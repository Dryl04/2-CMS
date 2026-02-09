/*
  # Mise à jour de la table seo_metadata pour le CMS v2

  1. Nouvelles colonnes
    - `slug` (text, URL slug unique)
    - `meta_description` (text, copie de description pour cohérence)
    - `h1` (text, titre principal H1)
    - `h2` (text, sous-titre H2)
    - `template_id` (uuid, référence vers page_templates)
    - `sections_content` (jsonb, contenu structuré par section)
    - `parent_page_key` (text, page parente pour hiérarchie)
    - `exclude_from_sitemap` (boolean)
    - `scheduled_at` (timestamptz, date de publication programmée)
    - `published_at` (timestamptz, date de publication effective)

  2. Modifications
    - Mise à jour du CHECK constraint pour le status (ajout 'pending', 'error')
    - Ajout d'index sur slug et status
*/

-- Ajouter la colonne slug
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'slug'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN slug text;
  END IF;
END $$;

-- Initialiser slug à partir de page_key pour les données existantes
UPDATE seo_metadata SET slug = page_key WHERE slug IS NULL;

-- Ajouter contrainte unique et NOT NULL (si données migrées)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seo_metadata_slug_key'
  ) THEN
    ALTER TABLE seo_metadata ADD CONSTRAINT seo_metadata_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Ajouter meta_description (alias de description pour cohérence code)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'meta_description'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN meta_description text;
  END IF;
END $$;

-- Copier description vers meta_description
UPDATE seo_metadata SET meta_description = description WHERE meta_description IS NULL AND description IS NOT NULL;

-- Colonnes h1, h2
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'h1'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN h1 text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'h2'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN h2 text;
  END IF;
END $$;

-- template_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN template_id uuid;
  END IF;
END $$;

-- sections_content (JSONB)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'sections_content'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN sections_content jsonb;
  END IF;
END $$;

-- parent_page_key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'parent_page_key'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN parent_page_key text;
  END IF;
END $$;

-- exclude_from_sitemap
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'exclude_from_sitemap'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN exclude_from_sitemap boolean DEFAULT false;
  END IF;
END $$;

-- scheduled_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'scheduled_at'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN scheduled_at timestamptz;
  END IF;
END $$;

-- published_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN published_at timestamptz;
  END IF;
END $$;

-- Mettre à jour le CHECK constraint du status
ALTER TABLE seo_metadata DROP CONSTRAINT IF EXISTS seo_metadata_status_check;
ALTER TABLE seo_metadata ADD CONSTRAINT seo_metadata_status_check 
  CHECK (status IN ('draft', 'pending', 'published', 'archived', 'error'));

-- Index sur slug
CREATE INDEX IF NOT EXISTS idx_seo_metadata_slug ON seo_metadata(slug);

-- Index sur exclude_from_sitemap
CREATE INDEX IF NOT EXISTS idx_seo_metadata_sitemap ON seo_metadata(exclude_from_sitemap) WHERE status = 'published';
