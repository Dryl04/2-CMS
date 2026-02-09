/*
  # Création de la table component_blocks pour les composants réutilisables
  
  Permet de stocker et gérer des blocs de composants HTML réutilisables.
*/

CREATE TABLE IF NOT EXISTS component_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  html_content text NOT NULL,
  thumbnail text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE component_blocks ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs authentifiés peuvent lire les composants
CREATE POLICY "Utilisateurs authentifiés peuvent lire les composants"
  ON component_blocks FOR SELECT
  TO authenticated
  USING (true);

-- Les utilisateurs authentifiés peuvent créer des composants
CREATE POLICY "Utilisateurs authentifiés peuvent créer des composants"
  ON component_blocks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Les utilisateurs authentifiés peuvent modifier les composants
CREATE POLICY "Utilisateurs authentifiés peuvent modifier les composants"
  ON component_blocks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Les utilisateurs authentifiés peuvent supprimer les composants
CREATE POLICY "Utilisateurs authentifiés peuvent supprimer les composants"
  ON component_blocks FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_component_blocks_category ON component_blocks(category);
