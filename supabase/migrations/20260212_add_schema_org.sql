/*
  # Ajout du support Schema.org
  
  1. Ajout colonne schema_type à seo_metadata
  2. Ajout colonne schema_options (JSONB) pour stocker les options spécifiques
*/

-- Ajouter la colonne schema_type
ALTER TABLE seo_metadata
ADD COLUMN IF NOT EXISTS schema_type text DEFAULT 'WebPage'
CHECK (schema_type IN ('Article', 'BlogPosting', 'Product', 'Service', 'FAQPage', 'WebPage'));

-- Ajouter la colonne schema_options pour les options supplémentaires
ALTER TABLE seo_metadata
ADD COLUMN IF NOT EXISTS schema_options jsonb DEFAULT '{}'::jsonb;

-- Créer un index pour les recherches par schema_type
CREATE INDEX IF NOT EXISTS idx_seo_metadata_schema_type ON seo_metadata(schema_type);

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN seo_metadata.schema_type IS 'Type de schema.org pour le structured data (Article, Product, Service, FAQPage, etc.)';
COMMENT ON COLUMN seo_metadata.schema_options IS 'Options JSON pour le schema.org (price, rating, faqItems, etc.)';
