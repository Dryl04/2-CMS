/*
  # Durcissement des politiques RLS pour production
  
  1. Objectif
    - Remplacer les politiques permissives par des règles basées sur les rôles
    - Sécuriser l'accès aux tables sensibles (publication_config, user_profiles)
    - Maintenir l'accès public en lecture pour les pages publiées uniquement
  
  2. Politiques par table
    - seo_metadata: Public READ pour published uniquement, admin/SEO/editor pour CRUD
    - page_templates: Public READ, authenticated pour CRUD
    - internal_links_rules: Public READ, admin/SEO pour CRUD
    - publication_config: Admin uniquement
    - media_files: Authenticated pour upload, public READ
    - component_blocks: Authenticated pour CRUD, public READ
    - user_profiles: Utilisateur peut lire/modifier son propre profil, admin peut tout voir
*/

-- ============================================
-- 1. HELPER FUNCTION pour vérifier le rôle
-- ============================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_seo()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'seo')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_above()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'seo', 'editor')
  );
$$;

-- ============================================
-- 2. SEO_METADATA - Pages
-- ============================================

-- Supprimer les politiques permissives
DROP POLICY IF EXISTS "Tout le monde peut lire les métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut créer des métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut mettre à jour les métadonnées" ON seo_metadata;
DROP POLICY IF EXISTS "Tout le monde peut supprimer les métadonnées" ON seo_metadata;

-- Lecture publique: Seulement pages publiées ET non exclues du sitemap
CREATE POLICY "Public peut lire pages publiées"
  ON seo_metadata FOR SELECT
  USING (status = 'published' AND is_public = true);

-- Authenticated peut lire toutes les pages (pour l'admin)
CREATE POLICY "Authenticated peut lire toutes les pages"
  ON seo_metadata FOR SELECT
  TO authenticated
  USING (true);

-- Editor et au-dessus peuvent créer
CREATE POLICY "Editor+ peut créer pages"
  ON seo_metadata FOR INSERT
  TO authenticated
  WITH CHECK (is_editor_or_above());

-- Editor et au-dessus peuvent modifier
CREATE POLICY "Editor+ peut modifier pages"
  ON seo_metadata FOR UPDATE
  TO authenticated
  USING (is_editor_or_above())
  WITH CHECK (is_editor_or_above());

-- Admin et SEO peuvent supprimer
CREATE POLICY "Admin/SEO peut supprimer pages"
  ON seo_metadata FOR DELETE
  TO authenticated
  USING (is_admin_or_seo());

-- ============================================
-- 3. PAGE_TEMPLATES - Modèles
-- ============================================

DROP POLICY IF EXISTS "Lecture publique des modèles" ON page_templates;
DROP POLICY IF EXISTS "Authentifié: créer modèles" ON page_templates;
DROP POLICY IF EXISTS "Authentifié: modifier modèles" ON page_templates;
DROP POLICY IF EXISTS "Authentifié: supprimer modèles" ON page_templates;

-- Lecture publique maintenue (pour preview)
CREATE POLICY "Public peut lire modèles"
  ON page_templates FOR SELECT
  USING (true);

-- Editor+ peut créer
CREATE POLICY "Editor+ peut créer modèles"
  ON page_templates FOR INSERT
  TO authenticated
  WITH CHECK (is_editor_or_above());

-- Editor+ peut modifier
CREATE POLICY "Editor+ peut modifier modèles"
  ON page_templates FOR UPDATE
  TO authenticated
  USING (is_editor_or_above())
  WITH CHECK (is_editor_or_above());

-- Admin/SEO peut supprimer
CREATE POLICY "Admin/SEO peut supprimer modèles"
  ON page_templates FOR DELETE
  TO authenticated
  USING (is_admin_or_seo());

-- ============================================
-- 4. INTERNAL_LINKS_RULES - Maillage interne
-- ============================================

DROP POLICY IF EXISTS "Lecture publique des règles internes" ON internal_links_rules;
DROP POLICY IF EXISTS "Authentifié: créer règles" ON internal_links_rules;
DROP POLICY IF EXISTS "Authentifié: modifier règles" ON internal_links_rules;
DROP POLICY IF EXISTS "Authentifié: supprimer règles" ON internal_links_rules;

-- Lecture publique (pour application automatique)
CREATE POLICY "Public peut lire règles actives"
  ON internal_links_rules FOR SELECT
  USING (is_active = true);

-- Authenticated peut lire toutes les règles (admin)
CREATE POLICY "Authenticated peut lire toutes règles"
  ON internal_links_rules FOR SELECT
  TO authenticated
  USING (true);

-- Admin/SEO peuvent créer
CREATE POLICY "Admin/SEO peut créer règles"
  ON internal_links_rules FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_seo());

-- Admin/SEO peuvent modifier
CREATE POLICY "Admin/SEO peut modifier règles"
  ON internal_links_rules FOR UPDATE
  TO authenticated
  USING (is_admin_or_seo())
  WITH CHECK (is_admin_or_seo());

-- Admin/SEO peuvent supprimer
CREATE POLICY "Admin/SEO peut supprimer règles"
  ON internal_links_rules FOR DELETE
  TO authenticated
  USING (is_admin_or_seo());

-- ============================================
-- 5. PUBLICATION_CONFIG - Configuration
-- ============================================

DROP POLICY IF EXISTS "Lecture publique config publication" ON publication_config;
DROP POLICY IF EXISTS "Authentifié: gérer config" ON publication_config;
DROP POLICY IF EXISTS "Authentifié: modifier config" ON publication_config;

-- Admin uniquement
CREATE POLICY "Admin peut lire config"
  ON publication_config FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin peut créer config"
  ON publication_config FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin peut modifier config"
  ON publication_config FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin peut supprimer config"
  ON publication_config FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- 6. MEDIA_FILES - Médias
-- ============================================

DROP POLICY IF EXISTS "Authenticated peut uploader médias" ON media_files;
DROP POLICY IF EXISTS "Public peut lire médias" ON media_files;

-- Lecture publique
CREATE POLICY "Public peut lire médias"
  ON media_files FOR SELECT
  USING (true);

-- Authenticated peut uploader
CREATE POLICY "Authenticated peut uploader médias"
  ON media_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by);

-- Propriétaire ou Admin peut modifier
CREATE POLICY "Propriétaire ou Admin peut modifier médias"
  ON media_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by OR is_admin())
  WITH CHECK (auth.uid() = uploaded_by OR is_admin());

-- Propriétaire ou Admin peut supprimer
CREATE POLICY "Propriétaire ou Admin peut supprimer médias"
  ON media_files FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by OR is_admin());

-- ============================================
-- 7. COMPONENT_BLOCKS - Composants réutilisables
-- ============================================

DROP POLICY IF EXISTS "Public peut lire composants" ON component_blocks;
DROP POLICY IF EXISTS "Authenticated peut créer composants" ON component_blocks;
DROP POLICY IF EXISTS "Authenticated peut modifier composants" ON component_blocks;
DROP POLICY IF EXISTS "Authenticated peut supprimer composants" ON component_blocks;

-- Lecture publique
CREATE POLICY "Public peut lire composants"
  ON component_blocks FOR SELECT
  USING (true);

-- Editor+ peut créer
CREATE POLICY "Editor+ peut créer composants"
  ON component_blocks FOR INSERT
  TO authenticated
  WITH CHECK (is_editor_or_above());

-- Propriétaire ou Admin peut modifier
CREATE POLICY "Propriétaire ou Admin peut modifier composants"
  ON component_blocks FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR is_admin())
  WITH CHECK (auth.uid() = created_by OR is_admin());

-- Propriétaire ou Admin peut supprimer
CREATE POLICY "Propriétaire ou Admin peut supprimer composants"
  ON component_blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR is_admin());

-- ============================================
-- 8. USER_PROFILES - Profils utilisateurs
-- ============================================

-- Les politiques sont déjà correctes dans 20260209_fix_user_profiles_rls.sql
-- Mais ajoutons une politique admin

DROP POLICY IF EXISTS "Admin peut lire tous les profils" ON user_profiles;

CREATE POLICY "Admin peut lire tous les profils"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- ============================================
-- 9. GRANT permissions
-- ============================================

-- S'assurer que les fonctions helper sont accessibles
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_seo() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_editor_or_above() TO authenticated, anon;
