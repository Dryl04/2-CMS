/*
  # Ajouter la colonne content à seo_metadata
  
  La colonne content stocke le contenu HTML/texte de la page.
*/

-- Ajouter la colonne content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'seo_metadata' AND column_name = 'content'
  ) THEN
    ALTER TABLE seo_metadata ADD COLUMN content text;
  END IF;
END $$;
