/*
  # Création de la table media_files
  
  Table pour stocker les métadonnées des fichiers médias uploadés.
  Utilisée en complément du storage bucket 'media'.
*/

-- Créer la table media_files
CREATE TABLE IF NOT EXISTS public.media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL UNIQUE,
  file_type text NOT NULL,
  file_size bigint,
  alt_text text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Créer un index sur uploaded_by pour les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON public.media_files(uploaded_by);

-- Créer un index sur file_type pour les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON public.media_files(file_type);

-- Activer RLS
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE public.media_files IS 'Métadonnées des fichiers médias uploadés dans le storage bucket media';
COMMENT ON COLUMN public.media_files.file_name IS 'Nom original du fichier';
COMMENT ON COLUMN public.media_files.file_path IS 'Chemin complet dans le storage bucket';
COMMENT ON COLUMN public.media_files.file_type IS 'Type MIME du fichier';
COMMENT ON COLUMN public.media_files.file_size IS 'Taille du fichier en octets';
COMMENT ON COLUMN public.media_files.alt_text IS 'Texte alternatif pour accessibilité';
COMMENT ON COLUMN public.media_files.uploaded_by IS 'UUID de l\'utilisateur qui a uploadé le fichier';
