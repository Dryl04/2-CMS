/*
  # Création de la table internal_links_rules
  
  Règles de maillage interne automatique.
  Chaque règle associe un mot-clé à une page cible.
*/

CREATE TABLE IF NOT EXISTS internal_links_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  target_page_key text NOT NULL,
  max_occurrences integer DEFAULT 1 CHECK (max_occurrences >= 1 AND max_occurrences <= 10),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE internal_links_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique des règles internes"
  ON internal_links_rules FOR SELECT
  USING (true);

CREATE POLICY "Authentifié: créer règles"
  ON internal_links_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authentifié: modifier règles"
  ON internal_links_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authentifié: supprimer règles"
  ON internal_links_rules FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_internal_links_keyword ON internal_links_rules(keyword);
CREATE INDEX IF NOT EXISTS idx_internal_links_active ON internal_links_rules(is_active) WHERE is_active = true;
