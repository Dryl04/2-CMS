/*
  # Création de la table publication_config
  
  Configuration de la publication progressive.
  Contrôle la cadence de publication automatisée.
*/

CREATE TABLE IF NOT EXISTS publication_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pages_per_day integer DEFAULT 5 CHECK (pages_per_day >= 1 AND pages_per_day <= 100),
  is_active boolean DEFAULT false,
  last_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE publication_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique config publication"
  ON publication_config FOR SELECT
  USING (true);

CREATE POLICY "Authentifié: gérer config"
  ON publication_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authentifié: modifier config"
  ON publication_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
