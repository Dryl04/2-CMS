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
