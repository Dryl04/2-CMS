/*
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
