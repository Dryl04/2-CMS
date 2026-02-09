# Étape 3 — Plan technique complet pour terminer l'application

> Roadmap de développement basée sur le cahier des charges et l'audit de l'existant

---

## 1. Évaluation de la stack technique

### Stack actuelle

| Technologie               | Adaptée ? | Commentaire                                                 |
| ------------------------- | --------- | ----------------------------------------------------------- |
| **React 18 + TypeScript** | ✅ Oui    | Bon choix pour une SPA riche en composants                  |
| **Vite**                  | ✅ Oui    | Build rapide, HMR performant                                |
| **Tailwind CSS 3**        | ✅ Oui    | Productivité UI élevée                                      |
| **Supabase**              | ✅ Oui    | Auth, DB, Storage, Edge Functions — couvre tous les besoins |
| **lucide-react**          | ✅ Oui    | Bibliothèque d'icônes légère                                |
| **Netlify**               | ✅ Oui    | Déploiement SPA + redirects                                 |

### Librairies à ajouter obligatoirement

| Besoin                   | Librairie recommandée                       | Raison                                                                       |
| ------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------- |
| **Routage**              | `react-router-dom` v6                       | Navigation multi-pages, deep linking, protection de routes                   |
| **Sanitization HTML**    | `dompurify`                                 | Éliminer la faille XSS dans le rendu de contenu HTML                         |
| **Meta SEO dynamiques**  | `react-helmet-async`                        | Injecter `<title>`, `<meta>`, `<link>` dans le `<head>`                      |
| **Drag & Drop**          | `@dnd-kit/core` + `@dnd-kit/sortable`       | Ordonnancement des sections du configurateur de modèle                       |
| **Éditeur Rich Text**    | `@tiptap/react` (ou `react-quill`)          | Édition WYSIWYG du contenu par section                                       |
| **Upload de fichiers**   | Supabase Storage (natif)                    | Stockage des médias (images, vidéos)                                         |
| **CSV parsing robuste**  | `papaparse`                                 | Parsing CSV complet (guillemets, virgules, multilignes)                      |
| **State management**     | `zustand`                                   | State global léger (configuration, session utilisateur, file de publication) |
| **Notifications/Toasts** | `sonner` ou `react-hot-toast`               | Remplacer les `alert()` par des toasts élégants                              |
| **Pagination**           | Implémentation maison (Supabase `.range()`) | Pagination côté serveur                                                      |
| **Date scheduling**      | `date-fns`                                  | Manipulation des dates pour la file de publication                           |

### Verdict stack

> **La stack de base (React + Vite + Tailwind + Supabase) est parfaitement adaptée.** Il manque surtout des librairies utilitaires et l'architecture applicative (routage, auth, state global).

---

## 2. Architecture cible

### 2.1 Structure de fichiers cible

```
src/
├── main.tsx
├── App.tsx                          # Router principal
├── index.css
├── vite-env.d.ts
│
├── lib/
│   ├── supabase.ts                  # Client Supabase
│   ├── auth.ts                      # Helpers authentification
│   ├── sanitize.ts                  # Sanitization HTML (DOMPurify)
│   └── utils.ts                     # Utilitaires communs
│
├── store/
│   ├── authStore.ts                 # État authentification (Zustand)
│   ├── templateStore.ts             # État modèles
│   └── publishStore.ts             # État file de publication
│
├── types/
│   ├── database.ts                  # Types Supabase (auto-généré ou manuel)
│   ├── template.ts                  # Types modèles de page
│   └── seo.ts                       # Types SEO metadata
│
├── hooks/
│   ├── useAuth.ts                   # Hook auth
│   ├── useSEOPages.ts              # Hook CRUD pages SEO avec pagination
│   ├── useTemplates.ts              # Hook CRUD modèles
│   └── usePublicationQueue.ts       # Hook gestion file publication
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx            # Layout admin (sidebar + content)
│   │   ├── PublicLayout.tsx          # Layout pages publiques (Header + Footer)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx              # Sidebar navigation admin
│   │
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleGuard.tsx
│   │
│   ├── dashboard/
│   │   ├── DashboardPage.tsx        # Tableau de bord principal
│   │   ├── StatusCards.tsx          # Compteurs de synthèse
│   │   └── PageList.tsx             # Liste paginée des pages
│   │
│   ├── templates/
│   │   ├── TemplateListPage.tsx     # Liste des modèles
│   │   ├── TemplateConfigurator.tsx  # Configurateur de modèle
│   │   ├── SectionCatalog.tsx       # Catalogue de sections
│   │   ├── SectionSortable.tsx      # Section ordonnançable (dnd)
│   │   └── TemplateExport.tsx       # Export JSON du modèle
│   │
│   ├── import/
│   │   ├── ImportPage.tsx           # Page d'import
│   │   ├── FileUploader.tsx         # Upload de fichiers JSON/CSV
│   │   ├── DataValidator.tsx        # Validation et rapport d'erreurs
│   │   └── ImportPreview.tsx        # Aperçu avant import
│   │
│   ├── editor/
│   │   ├── PageEditorPage.tsx       # Éditeur de page complet
│   │   ├── SectionEditor.tsx        # Édition par section (rich text)
│   │   ├── MediaManager.tsx         # Gestionnaire de médias
│   │   ├── SEOFieldsEditor.tsx      # Champs SEO (title, desc, OG)
│   │   └── PagePreview.tsx          # Prévisualisation temps réel
│   │
│   ├── seo/
│   │   ├── SEOSettingsPage.tsx      # Paramètres SEO & architecture
│   │   ├── PageHierarchy.tsx        # Arborescence parent/enfant
│   │   ├── InternalLinksRules.tsx   # Règles de maillage interne
│   │   └── SitemapManager.tsx       # Config sitemap
│   │
│   ├── publication/
│   │   ├── PublicationPage.tsx      # Administration de publication
│   │   ├── PublicationQueue.tsx     # File d'attente visuelle
│   │   └── PublicationScheduler.tsx # Paramètres de cadence
│   │
│   ├── public/
│   │   ├── PublicPage.tsx           # Rendu page publique (SEO-ready)
│   │   └── LandingPage.tsx          # Page d'accueil du CMS (optionnelle)
│   │
│   └── ui/
│       ├── Pagination.tsx
│       ├── StatusBadge.tsx
│       ├── ConfirmDialog.tsx
│       ├── Toast.tsx
│       └── LoadingSpinner.tsx
│
└── pages/                           # (optionnel, si on préfère file-based routing)
```

### 2.2 Schéma base de données cible

```sql
-- Tables à ajouter

-- Modèles de page
CREATE TABLE page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sections jsonb NOT NULL DEFAULT '[]',
  -- sections : [{id, type, label, required, min_words, max_words, order}]
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Colonnes à ajouter à seo_metadata
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS parent_page_key text REFERENCES seo_metadata(page_key);
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES page_templates(id);
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS sections_content jsonb;  -- contenu structuré par section
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS exclude_from_sitemap boolean DEFAULT false;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;  -- date planifiée de publication
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS published_at timestamptz;  -- date effective de publication
-- Ajouter 'pending' et 'error' comme statuts valides
-- ALTER TABLE seo_metadata DROP CONSTRAINT IF EXISTS seo_metadata_status_check;
-- ALTER TABLE seo_metadata ADD CONSTRAINT seo_metadata_status_check
--   CHECK (status IN ('draft', 'pending', 'published', 'archived', 'error'));

-- Règles de maillage interne
CREATE TABLE internal_links_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  target_page_key text NOT NULL REFERENCES seo_metadata(page_key) ON DELETE CASCADE,
  max_occurrences int DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Configuration de publication
CREATE TABLE publication_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pages_per_day int NOT NULL DEFAULT 10,
  is_active boolean DEFAULT false,
  last_run_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Médias
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,    -- chemin dans Supabase Storage
  file_type text NOT NULL,    -- image/jpeg, video/mp4, etc.
  file_size bigint,
  alt_text text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

### 2.3 Routes applicatives

```
/                         → Landing page (publique)
/login                    → Connexion
/admin                    → Tableau de bord (protégé)
/admin/pages              → Liste des pages SEO
/admin/pages/new          → Créer une page (formulaire)
/admin/pages/:id/edit     → Éditer une page
/admin/templates          → Liste des modèles de page
/admin/templates/new      → Créer un modèle
/admin/templates/:id/edit → Modifier un modèle
/admin/import             → Import en masse
/admin/seo-settings       → Paramètres SEO & architecture
/admin/publication        → Administration de publication
/:slug                    → Page publique rendue dynamiquement
```

---

## 3. Plan de développement par phases

### Phase 0 — Fondations & corrections critiques (Priorité : IMMÉDIATE)

**Durée estimée : 2-3 jours**

| #   | Tâche                                       | Détail                                                                                              |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 0.1 | Installer les dépendances manquantes        | `react-router-dom`, `dompurify`, `react-helmet-async`, `zustand`, `sonner`, `papaparse`, `date-fns` |
| 0.2 | Mettre en place le routeur                  | Configurer `react-router-dom` avec toutes les routes                                                |
| 0.3 | Corriger la faille XSS                      | Intégrer DOMPurify dans `SEOPageViewer`                                                             |
| 0.4 | Corriger les props inutilisées              | Ajouter les boutons Edit/Back dans `SEOPageViewer`                                                  |
| 0.5 | Remplacer les `alert()` par des toasts      | Via `sonner`                                                                                        |
| 0.6 | Corriger le `index.html`                    | Mettre un titre et des metas pertinents                                                             |
| 0.7 | Créer le layout admin (AppLayout + Sidebar) | Structure commune pour toutes les pages admin                                                       |
| 0.8 | Créer le store Zustand de base              | Auth store, config store                                                                            |

### Phase 1 — Authentification & sécurité (Priorité : HAUTE)

**Durée estimée : 2-3 jours**

| #   | Tâche                                    | Détail                                                      |
| --- | ---------------------------------------- | ----------------------------------------------------------- |
| 1.1 | Activer Supabase Auth                    | Configuration email/mot de passe dans le dashboard Supabase |
| 1.2 | Créer `LoginPage.tsx`                    | Formulaire connexion / inscription                          |
| 1.3 | Créer `ProtectedRoute.tsx`               | HOC ou wrapper qui redirige vers /login si non connecté     |
| 1.4 | Créer `RoleGuard.tsx`                    | Vérification des rôles (SEO vs Admin)                       |
| 1.5 | Restaurer les politiques RLS correctes   | Authentification requise pour les opérations CRUD           |
| 1.6 | Créer un hook `useAuth`                  | Login, logout, session, rôle                                |
| 1.7 | Ajouter une table de profils utilisateur | `user_profiles(id, email, role, created_at)`                |

### Phase 2 — Tableau de bord amélioré (Priorité : HAUTE)

**Durée estimée : 2-3 jours**

| #   | Tâche                                               | Détail                                               |
| --- | --------------------------------------------------- | ---------------------------------------------------- |
| 2.1 | Migration DB : ajouter statuts "pending" et "error" | Mise à jour de la contrainte CHECK                   |
| 2.2 | Créer `StatusCards.tsx`                             | Compteurs visuels par statut                         |
| 2.3 | Implémenter la pagination serveur                   | Via Supabase `.range()` + composant `Pagination.tsx` |
| 2.4 | Refactorer `SEOManager` → `DashboardPage`           | Intégrer dans le layout admin avec sidebar           |
| 2.5 | Améliorer les filtres                               | Ajouter tri par date, taille du contenu, etc.        |

### Phase 3 — Configurateur de modèle & export (Priorité : HAUTE)

**Durée estimée : 4-5 jours**

| #   | Tâche                                       | Détail                                                                 |
| --- | ------------------------------------------- | ---------------------------------------------------------------------- |
| 3.1 | Migration DB : créer table `page_templates` | Avec sections en JSONB                                                 |
| 3.2 | Créer le catalogue de sections prédéfinies  | Hero, Texte riche, Image + texte, FAQ, CTA, Témoignages, Galerie, etc. |
| 3.3 | Créer `TemplateConfigurator.tsx`            | Interface de construction de modèles                                   |
| 3.4 | Intégrer `@dnd-kit` pour le drag & drop     | Ordonnancement visuel des sections                                     |
| 3.5 | Définition des contraintes par section      | Champs min_words, max_words, required                                  |
| 3.6 | CRUD des modèles dans Supabase              | Create, Read, Update, Delete                                           |
| 3.7 | Créer `TemplateExport.tsx`                  | Génération et téléchargement du JSON de structure                      |
| 3.8 | Créer `TemplateListPage.tsx`                | Liste des modèles avec actions                                         |

### Phase 4 — Import de contenu amélioré (Priorité : HAUTE)

**Durée estimée : 3-4 jours**

| #   | Tâche                                           | Détail                                                                     |
| --- | ----------------------------------------------- | -------------------------------------------------------------------------- |
| 4.1 | Intégrer `papaparse` pour le CSV                | Remplacer le parser naïf                                                   |
| 4.2 | Ajouter l'upload de fichiers                    | Bouton d'upload en plus du copier-coller                                   |
| 4.3 | Validation de conformité au modèle              | Vérifier que le JSON importé respecte la structure du template sélectionné |
| 4.4 | Distinction erreurs bloquantes / non-bloquantes | UI différenciée (rouge / orange)                                           |
| 4.5 | Sécurisation des imports                        | Limite de taille, type de fichier, nombre d'entrées                        |
| 4.6 | Détection avancée des doublons                  | Vérification préalable via requête Supabase avant import                   |
| 4.7 | Import rattaché à un modèle                     | Sélection du modèle cible à l'import                                       |

### Phase 5 — Éditeur de page enrichi (Priorité : HAUTE)

**Durée estimée : 5-6 jours**

| #   | Tâche                                             | Détail                                                      |
| --- | ------------------------------------------------- | ----------------------------------------------------------- |
| 5.1 | Migrer le contenu vers `sections_content` (JSONB) | Stocker le contenu structuré par section                    |
| 5.2 | Intégrer Tiptap comme éditeur rich text           | WYSIWYG par section                                         |
| 5.3 | Créer `SectionEditor.tsx`                         | Composant d'édition par section selon le template           |
| 5.4 | Créer `MediaManager.tsx`                          | Upload, listage et sélection de médias via Supabase Storage |
| 5.5 | Ajout d'images de fond par section                | Sélecteur d'image + preview                                 |
| 5.6 | Créer `PagePreview.tsx`                           | Prévisualisation temps réel (split view ou onglet)          |
| 5.7 | Configuration globale du domaine                  | Stocker le domaine de base en config globale                |
| 5.8 | Refactorer `SEOForm` → `PageEditorPage`           | Intégrer les sections, médias et preview                    |

### Phase 6 — Paramètres SEO & architecture (Priorité : HAUTE)

**Durée estimée : 4-5 jours**

| #   | Tâche                                             | Détail                                                  |
| --- | ------------------------------------------------- | ------------------------------------------------------- |
| 6.1 | Migration DB : ajouter `parent_page_key`          | Hiérarchie des pages                                    |
| 6.2 | Migration DB : créer table `internal_links_rules` | Règles de maillage                                      |
| 6.3 | Créer `PageHierarchy.tsx`                         | Interface arborescente pour définir les parents         |
| 6.4 | Créer `InternalLinksRules.tsx`                    | CRUD des règles mots-clés → pages cibles                |
| 6.5 | Implémenter le moteur de maillage automatique     | Fonction qui scanne le contenu et insère les liens      |
| 6.6 | Créer `SitemapManager.tsx`                        | Toggle inclusion/exclusion par page + aperçu du sitemap |
| 6.7 | Intégrer `react-helmet-async`                     | Injection dynamique des balises meta dans le `<head>`   |
| 6.8 | Mettre à jour l'Edge Function sitemap             | Respecter le champ `exclude_from_sitemap`               |

### Phase 7 — Administration de publication (Priorité : HAUTE)

**Durée estimée : 3-4 jours**

| #   | Tâche                                                 | Détail                                                    |
| --- | ----------------------------------------------------- | --------------------------------------------------------- |
| 7.1 | Migration DB : créer table `publication_config`       | Configuration cadence                                     |
| 7.2 | Migration DB : ajouter `scheduled_at`, `published_at` | Dates de planification                                    |
| 7.3 | Créer `PublicationScheduler.tsx`                      | Définir pages/jour et activer/désactiver                  |
| 7.4 | Créer `PublicationQueue.tsx`                          | Visualisation de la file d'attente (timeline, calendrier) |
| 7.5 | Créer une Edge Function de publication planifiée      | Exécution périodique (cron) : publie N pages/jour         |
| 7.6 | Ajout du statut "pending" dans le workflow            | Transition draft → pending → published                    |
| 7.7 | Intégrer la mise à jour du sitemap après publication  | Appel automatique après changement de statut              |

### Phase 8 — Rendu des pages publiques (Priorité : HAUTE)

**Durée estimée : 2-3 jours**

| #   | Tâche                                           | Détail                                               |
| --- | ----------------------------------------------- | ---------------------------------------------------- |
| 8.1 | Créer `PublicPage.tsx`                          | Composant de rendu par section avec styles           |
| 8.2 | Intégrer DOMPurify partout                      | Sanitization de tout contenu HTML rendu              |
| 8.3 | Intégrer react-helmet-async                     | Balises SEO dynamiques par page                      |
| 8.4 | Appliquer le maillage interne au rendu          | Remplacement automatique des mots-clés par des liens |
| 8.5 | Rendre la landing page optionnelle/configurable | Séparer la landing du CMS                            |

### Phase 9 — Tests, polish et optimisation (Priorité : MOYENNE)

**Durée estimée : 3-4 jours**

| #   | Tâche                                | Détail                                            |
| --- | ------------------------------------ | ------------------------------------------------- |
| 9.1 | Écrire des tests unitaires critiques | Validation import, sanitization, maillage interne |
| 9.2 | Tests E2E du parcours principal      | Import → édition → publication                    |
| 9.3 | Optimisation des performances        | Pagination, lazy loading, code splitting          |
| 9.4 | Responsive design complet            | Tester et corriger les vues mobiles               |
| 9.5 | Accessibilité (a11y)                 | Labels, aria, navigation clavier                  |
| 9.6 | Documentation utilisateur            | Guide d'utilisation in-app                        |

---

## 4. Résumé des priorités

```
Phase 0 ████████░░  Fondations          → 2-3 jours
Phase 1 ████████░░  Authentification     → 2-3 jours
Phase 2 ██████░░░░  Tableau de bord      → 2-3 jours
Phase 3 ██████████  Configurateur        → 4-5 jours
Phase 4 ████████░░  Import amélioré      → 3-4 jours
Phase 5 ██████████  Éditeur enrichi      → 5-6 jours
Phase 6 ██████████  SEO & architecture   → 4-5 jours
Phase 7 ████████░░  Publication          → 3-4 jours
Phase 8 ██████░░░░  Pages publiques      → 2-3 jours
Phase 9 ██████░░░░  Tests & polish       → 3-4 jours
─────────────────────────────────────────────────────
TOTAL ESTIMÉ :                           30-40 jours ouvrés
```

---

## 5. Dépendances entre phases

```
Phase 0 (Fondations)
  └── Phase 1 (Auth)
       └── Phase 2 (Dashboard)
            ├── Phase 3 (Configurateur)
            │    └── Phase 4 (Import amélioré)
            │         └── Phase 5 (Éditeur enrichi)
            ├── Phase 6 (SEO & architecture)
            └── Phase 7 (Publication)
                 └── Phase 8 (Pages publiques)
                      └── Phase 9 (Tests & polish)
```

> **Phase 0 et 1 sont les prérequis absolus.** Les Phases 3-7 peuvent être partiellement parallélisées si plusieurs développeurs travaillent sur le projet.

---

## 6. Risques identifiés

| Risque                            | Impact                                                                 | Mitigation                                                                               |
| --------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| SEO : React SPA = pas de SSR      | Les metas injectées côté client ne sont pas lues par tous les crawlers | Envisager un pré-rendu (prerender.io) ou un passage à Next.js si le SEO pur est critique |
| Performance avec 300+ pages       | Lenteur de chargement si pas de pagination                             | Pagination serveur obligatoire (Phase 2)                                                 |
| Sécurité RLS ouvertes             | Données accessibles/modifiables par n'importe qui                      | Phase 1 prioritaire                                                                      |
| Complexité de l'éditeur rich text | Intégration Tiptap peut être chronophage                               | Prévoir du temps supplémentaire en Phase 5                                               |
| Publication planifiée             | Supabase n'a pas de cron natif fiable                                  | Utiliser `pg_cron` (extension Supabase) ou un service externe                            |

---

## 7. Alternative SSR (à considérer)

Si le SEO est le coeur critique du projet (ce qui semble être le cas), il faut **sérieusement envisager** une migration vers **Next.js** (ou Remix/Astro) pour bénéficier :

- du Server-Side Rendering (SSR) pour les pages publiques
- de la génération statique (SSG/ISR) pour les pages publiées
- d'un meilleur support des métadonnées SEO
- du routage natif basé sur les fichiers

**Impact** : La migration vers Next.js nécessiterait ~3-5 jours supplémentaires mais résoudrait définitivement le problème SEO. L'interface admin resterait une SPA classique (React), seules les pages publiques seraient rendues côté serveur.

**Recommandation** : Si l'objectif est réellement de **publier des pages optimisées pour le référencement naturel**, Next.js est le meilleur choix technique. La stack actuelle (React SPA) est inadaptée pour le SEO des pages publiques.
