/*
  # Création de la table pour les métadonnées SEO

  1. Nouvelles tables
    - `seo_metadata`
      - `id` (uuid, clé primaire)
      - `page_key` (text, identifiant unique de la page)
      - `title` (text, titre SEO)
      - `description` (text, description meta)
      - `keywords` (text[], mots-clés)
      - `og_title` (text, Open Graph title)
      - `og_description` (text, Open Graph description)
      - `og_image` (text, URL image Open Graph)
      - `canonical_url` (text, URL canonique)
      - `language` (text, langue du contenu)
      - `status` (text, statut: draft, published, archived)
      - `imported_at` (timestamptz, date d'import)
      - `created_by` (text, email de l'utilisateur)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur `seo_metadata`
    - Politique pour lecture publique des métadonnées publiées
    - Politique pour modification par utilisateurs authentifiés
*/

CREATE TABLE IF NOT EXISTS seo_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  keywords text[],
  og_title text,
  og_description text,
  og_image text,
  canonical_url text,
  language text DEFAULT 'fr',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  imported_at timestamptz,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les métadonnées publiées"
  ON seo_metadata
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Utilisateurs authentifiés peuvent créer des métadonnées"
  ON seo_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les métadonnées"
  ON seo_metadata
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifiés peuvent supprimer les métadonnées"
  ON seo_metadata
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_seo_metadata_page_key ON seo_metadata(page_key);
CREATE INDEX IF NOT EXISTS idx_seo_metadata_status ON seo_metadata(status);/*
  # Mise à jour des politiques RLS pour seo_metadata
  
  1. Modifications
    - Suppression des politiques restrictives nécessitant l'authentification
    - Ajout de politiques permissives pour permettre toutes les opérations
    - Ceci permet l'utilisation sans authentification pour le moment
  
  2. Note de sécurité
    - Pour un environnement de production, il est recommandé d'ajouter l'authentification
    - Ces politiques sont adaptées pour un environnement de développement/test
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seo_metadata' 
    AND policyname = 'Tout le monde peut lire les métadonnées publiées'
  ) THEN
    DROP POLICY "Tout le monde peut lire les métadonnées publiées" ON seo_metadata;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seo_metadata' 
    AND policyname = 'Utilisateurs authentifiés peuvent créer des métadonnées'
  ) THEN
    DROP POLICY "Utilisateurs authentifiés peuvent créer des métadonnées" ON seo_metadata;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seo_metadata' 
    AND policyname = 'Utilisateurs authentifiés peuvent mettre à jour les métadonnées'
  ) THEN
    DROP POLICY "Utilisateurs authentifiés peuvent mettre à jour les métadonnées" ON seo_metadata;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seo_metadata' 
    AND policyname = 'Utilisateurs authentifiés peuvent supprimer les métadonnées'
  ) THEN
    DROP POLICY "Utilisateurs authentifiés peuvent supprimer les métadonnées" ON seo_metadata;
  END IF;
END $$;

CREATE POLICY "Tout le monde peut lire les métadonnées"
  ON seo_metadata
  FOR SELECT
  USING (true);

CREATE POLICY "Tout le monde peut créer des métadonnées"
  ON seo_metadata
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut mettre à jour les métadonnées"
  ON seo_metadata
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Tout le monde peut supprimer les métadonnées"
  ON seo_metadata
  FOR DELETE
  USING (true);
/*
  # Ajout d'une colonne de contenu pour les pages SEO
  
  1. Modifications
    - Ajout de la colonne `content` à la table `seo_metadata`
      - `content` (text, contenu textuel de la page, nullable)
    
  2. Notes
    - Le contenu peut être du texte simple ou du HTML
    - Cette colonne permet de stocker le contenu principal de chaque page
    - Nullable pour permettre la compatibilité avec les données existantes
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'seo_metadata' 
    AND column_name = 'content'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN content text;
  END IF;
END $$;
