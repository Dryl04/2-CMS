/*
  # Création de la table user_profiles
  
  Profils utilisateurs avec rôle pour le contrôle d'accès.
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'seo' CHECK (role IN ('admin', 'seo', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur peut lire son propre profil
CREATE POLICY "Utilisateur peut lire son profil"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Les admins peuvent tout lire
CREATE POLICY "Admin peut lire tous les profils"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- L'utilisateur peut créer son propre profil (lors du signup)
CREATE POLICY "Utilisateur peut créer son profil"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- L'utilisateur peut modifier son propre profil
CREATE POLICY "Utilisateur peut modifier son profil"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
