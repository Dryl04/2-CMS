/*
  # Correction des politiques RLS sur user_profiles
  
  Le problème: La politique pour admin référence la même table et cause une erreur 500
  La solution: Simplifier en une policy qui permet à l'utilisateur de lire son propre profil
*/

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Utilisateur peut lire son profil" ON user_profiles;
DROP POLICY IF EXISTS "Admin peut lire tous les profils" ON user_profiles;
DROP POLICY IF EXISTS "Utilisateur peut créer son profil" ON user_profiles;
DROP POLICY IF EXISTS "Utilisateur peut modifier son profil" ON user_profiles;
DROP POLICY IF EXISTS "Utilisateurs authentifiés peuvent lire les profils" ON user_profiles;

-- Créer les politiques avec vérification conditionnelle
DO $$
BEGIN
  -- Créer la politique SELECT
  CREATE POLICY "Utilisateurs authentifiés peuvent lire les profils"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  -- Créer la politique INSERT
  CREATE POLICY "Utilisateur peut créer son profil"
    ON user_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  -- Créer la politique UPDATE
  CREATE POLICY "Utilisateur peut modifier son profil"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
