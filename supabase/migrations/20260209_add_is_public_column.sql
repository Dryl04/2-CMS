/*
  # Ajouter la colonne is_public à seo_metadata
  
  La colonne est_public permet de contrôler la visibilité publique des pages
  indépendamment du statut de publication.
*/

-- Ajouter la colonne is_public
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN is_public boolean DEFAULT true;
  END IF;
END $$;
-- Convertir les NULL en true
UPDATE seo_metadata SET is_public = true WHERE is_public IS NULL;

-- Ajouter la contrainte NOT NULL
ALTER TABLE seo_metadata ALTER COLUMN is_public SET NOT NULL;
-- Créer un index
CREATE INDEX IF NOT EXISTS idx_seo_metadata_is_public ON seo_metadata(is_public) WHERE status = 'published';
