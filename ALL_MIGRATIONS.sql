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
/*
  # Création de la table page_templates
  
  Table pour stocker les modèles de pages réutilisables.
  Chaque modèle définit une structure de sections avec contraintes.
*/

CREATE TABLE IF NOT EXISTS page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Lecture publique des modèles"
  ON page_templates FOR SELECT
  USING (true);

-- CRUD authentifié
CREATE POLICY "Authentifié: créer modèles"
  ON page_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authentifié: modifier modèles"
  ON page_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authentifié: supprimer modèles"
  ON page_templates FOR DELETE
  TO authenticated
  USING (true);

-- Ajouter la FK sur seo_metadata.template_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'seo_metadata_template_id_fkey'
  ) THEN
    ALTER TABLE seo_metadata 
      ADD CONSTRAINT seo_metadata_template_id_fkey 
      FOREIGN KEY (template_id) REFERENCES page_templates(id) ON DELETE SET NULL;
  END IF;
END $$;
/*
  # Création de la table internal_links_rules
  
  Règles de maillage interne automatique.
  Chaque règle associe un mot-clé à une page cible.
*/

CREATE TABLE IF NOT EXISTS internal_links_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  target_page_key text NOT NULL,
  max_occurrences integer DEFAULT 1 CHECK (max_occurrences >= 1 AND max_occurrences <= 10),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE internal_links_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des règles internes"
  ON internal_links_rules FOR SELECT
  USING (true);

CREATE POLICY "Authentifié: créer règles"
  ON internal_links_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authentifié: modifier règles"
  ON internal_links_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authentifié: supprimer règles"
  ON internal_links_rules FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_internal_links_keyword ON internal_links_rules(keyword);
CREATE INDEX IF NOT EXISTS idx_internal_links_active ON internal_links_rules(is_active) WHERE is_active = true;
/*
  # Création de la table publication_config
  
  Configuration de la publication progressive.
  Contrôle la cadence de publication automatisée.
*/

CREATE TABLE IF NOT EXISTS publication_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pages_per_day integer DEFAULT 5 CHECK (pages_per_day >= 1 AND pages_per_day <= 100),
  is_active boolean DEFAULT false,
  last_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE publication_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique config publication"
  ON publication_config FOR SELECT
  USING (true);

CREATE POLICY "Authentifié: gérer config"
  ON publication_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authentifié: modifier config"
  ON publication_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
/*
  # Création de la table user_profiles
  
  Profils utilisateurs avec rôle pour le contrôle d'accès.
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'seo' CHECK (role IN ('admin', 'seo', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur peut lire son propre profil
CREATE POLICY "Utilisateur peut lire son profil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Les admins peuvent tout lire
CREATE POLICY "Admin peut lire tous les profils"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- L'utilisateur peut créer son propre profil (lors du signup)
CREATE POLICY "Utilisateur peut créer son profil"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- L'utilisateur peut modifier son propre profil
CREATE POLICY "Utilisateur peut modifier son profil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
/*
  # Création du storage bucket pour les médias

  Bucket public pour stocker les images uploadées via le CMS.
*/

-- Créer le bucket media s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Politique: lecture publique
CREATE POLICY "Images publiques" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

-- Politique: upload authentifié
CREATE POLICY "Upload authentifié" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Politique: suppression authentifiée
CREATE POLICY "Suppression authentifiée" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');
