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
