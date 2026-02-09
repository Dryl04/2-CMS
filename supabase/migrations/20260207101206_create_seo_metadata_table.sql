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
CREATE INDEX IF NOT EXISTS idx_seo_metadata_status ON seo_metadata(status);