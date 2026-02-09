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
