# Étape 2 — Audit de l'implémentation actuelle

> Analyse exhaustive de l'état actuel du projet au 09/02/2026

---

## 1. Stack technique utilisée

| Couche          | Technologie                            | Version            |
| --------------- | -------------------------------------- | ------------------ |
| Framework front | React + TypeScript                     | React 18.3, TS 5.5 |
| Build tool      | Vite                                   | 5.4                |
| CSS             | Tailwind CSS                           | 3.4                |
| Base de données | Supabase (PostgreSQL)                  | supabase-js 2.57   |
| Icônes          | lucide-react                           | 0.344              |
| Hébergement     | Netlify (fichier `_redirects` présent) | —                  |
| Sitemap         | Supabase Edge Function (Deno)          | —                  |

**Absences notables :**

- Aucun routeur (pas de `react-router-dom`) → navigation gérée par un `useState` dans `App.tsx`
- Aucune gestion d'authentification côté front
- Aucune bibliothèque de composants rich text / drag & drop
- Aucun state manager global (Redux, Zustand, etc.)
- Aucun système de tests

---

## 2. Architecture de la base de données

**Table unique : `seo_metadata`**

| Colonne        | Type          | Description                  |
| -------------- | ------------- | ---------------------------- |
| id             | uuid PK       | Identifiant                  |
| page_key       | text UNIQUE   | Slug / identifiant URL       |
| title          | text NOT NULL | Titre SEO                    |
| description    | text          | Meta description             |
| keywords       | text[]        | Mots-clés                    |
| og_title       | text          | Open Graph title             |
| og_description | text          | Open Graph description       |
| og_image       | text          | URL image OG                 |
| canonical_url  | text          | URL canonique                |
| language       | text          | Langue (fr par défaut)       |
| status         | text          | draft / published / archived |
| content        | text          | Contenu HTML de la page      |
| imported_at    | timestamptz   | Date d'import                |
| created_by     | text          | Auteur                       |
| created_at     | timestamptz   | Date de création             |
| updated_at     | timestamptz   | Date de modification         |

**Politiques RLS :** Toutes ouvertes (aucune authentification requise) — **dangereux en production**.

**Tables manquantes par rapport au cahier des charges :**

- `page_templates` (modèles de pages avec sections)
- `template_sections` (sections d'un modèle avec contraintes)
- `internal_links_rules` (règles de maillage interne)
- `publication_queue` (file d'attente de publication)
- `users` / rôles (gestion des droits)
- `media` (gestion des médias uploadés)
- `page_hierarchy` (hiérarchie parent/enfant des pages)

---

## 3. Recensement des fonctionnalités

### 3.1 Fonctionnalités PARTIELLEMENT implémentées (inachevées)

#### A. Tableau de bord / Liste des pages (`SEOManager.tsx`)

**État : ~50% implémenté**

| Sous-fonctionnalité       | État        | Détail                                                                |
| ------------------------- | ----------- | --------------------------------------------------------------------- |
| Liste des pages           | ✅ Fait     | Via requête Supabase                                                  |
| Filtrage par statut       | ✅ Fait     | draft / published / archived                                          |
| Recherche textuelle       | ✅ Fait     | Sur page_key, titre, description                                      |
| Changement de statut      | ✅ Fait     | Boutons Draft/Publish/Archive                                         |
| Suppression               | ✅ Fait     | Avec confirmation                                                     |
| Visualisation             | ✅ Fait     | Rendu via `SEOPageViewer`                                             |
| **Pagination**            | ❌ Manquant | Toutes les pages chargées d'un coup                                   |
| **Compteurs de synthèse** | ❌ Manquant | Aucun indicateur en haut du dashboard                                 |
| **Statut "en attente"**   | ❌ Manquant | Seuls draft/published/archived existent, pas "en attente" ni "erreur" |

**Problèmes :**

- Pas de pagination → **ne tiendra pas avec 300+ pages** (KPI du cahier des charges)
- Le statut "en attente" du cahier des charges n'est pas implémenté dans la DB
- Pas de statut "erreur" non plus

#### B. Import de contenu (`SEOImporter.tsx`)

**État : ~60% implémenté**

| Sous-fonctionnalité                               | État        | Détail                                                                                                 |
| ------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| Import JSON                                       | ✅ Fait     | Collage de texte JSON                                                                                  |
| Import CSV                                        | ✅ Fait     | Collage de texte CSV                                                                                   |
| Templates d'exemple                               | ✅ Fait     | 5 templates JSON + CSV                                                                                 |
| Validation des champs obligatoires                | ✅ Fait     | page_key et title vérifiés                                                                             |
| Validation du format de données                   | ✅ Fait     | Parsing JSON/CSV avec gestion erreurs                                                                  |
| Aperçu avant import                               | ✅ Fait     | Affichage des données parsées                                                                          |
| Rapport d'erreurs                                 | ✅ Fait     | Liste des erreurs de validation                                                                        |
| Upsert (création/mise à jour)                     | ✅ Fait     | Via onConflict page_key                                                                                |
| **Import par fichier (upload)**                   | ❌ Manquant | Seulement par copier-coller, pas d'upload de fichier                                                   |
| **Validation de conformité au modèle**            | ❌ Manquant | Pas de modèle/template de structure à valider                                                          |
| **Validation des contraintes de longueur (mots)** | ❌ Manquant | Seuls title (60 chars) et description (160 chars) vérifiés, pas de contrainte min/max mots par section |
| **Erreurs bloquantes vs non-bloquantes**          | ❌ Manquant | Toutes les erreurs sont traitées au même niveau                                                        |

**Problèmes :**

- Le parser CSV est naïf : ne gère pas les champs contenant des virgules (pas de support des guillemets)
- La validation des longueurs (title ≤ 60, description ≤ 160) est en **caractères et non en mots** — le cahier des charges mentionne des mots
- Pas de gestion de la taille maximale d'import

#### C. Éditeur de page / Formulaire (`SEOForm.tsx`)

**État : ~40% implémenté**

| Sous-fonctionnalité              | État        | Détail                                  |
| -------------------------------- | ----------- | --------------------------------------- |
| Édition du slug                  | ✅ Fait     | Via champ slug + sous-chemin            |
| Édition du titre SEO             | ✅ Fait     | Avec compteur de caractères             |
| Édition de la description        | ✅ Fait     | Avec compteur de caractères             |
| Édition des mots-clés            | ✅ Fait     | Séparés par virgules                    |
| Édition du contenu (HTML brut)   | ✅ Fait     | Textarea avec HTML accepté              |
| Open Graph (titre, desc, image)  | ✅ Fait     | Dans section « Options avancées »       |
| Choix du statut                  | ✅ Fait     | Draft / Published / Archived            |
| Templates prédéfinis             | ✅ Fait     | 3 templates (page, produit, article)    |
| URL canonique auto               | ✅ Fait     | Construite automatiquement              |
| Upsert                           | ✅ Fait     | Via onConflict page_key                 |
| **Édition par section visuelle** | ❌ Manquant | Le contenu est un seul champ HTML brut  |
| **Gestion des médias**           | ❌ Manquant | Aucun upload d'image/vidéo              |
| **Images de fond par section**   | ❌ Manquant | Pas de sections                         |
| **Éditeur rich text / WYSIWYG**  | ❌ Manquant | Seulement un textarea HTML              |
| **Prévisualisation live**        | ❌ Manquant | Pas de split view ou preview temps réel |

**Problèmes :**

- L'édition de contenu HTML brut dans un textarea n'est pas viable pour un utilisateur SEO non-technique
- Pas de validation du HTML saisi
- Le domaine est saisi manuellement alors qu'il devrait être une configuration globale

#### D. Visualisation de page (`SEOPageViewer.tsx`)

**État : ~30% implémenté**

| Sous-fonctionnalité                     | État          | Détail                                                                        |
| --------------------------------------- | ------------- | ----------------------------------------------------------------------------- |
| Rendu du titre et description           | ✅ Fait       | Affichage basique                                                             |
| Rendu du HTML (dangerouslySetInnerHTML) | ✅ Fait       | **Faille XSS**                                                                |
| Header et Footer                        | ✅ Fait       | Composants réutilisés                                                         |
| **Injection des balises meta SEO**      | ❌ Manquant   | Aucun `<head>` dynamique (pas de react-helmet ou équivalent)                  |
| **Rendu par section**                   | ❌ Manquant   | Un seul bloc HTML                                                             |
| **Boutons onEdit et onBack**            | ⚠️ Défaillant | Props reçues mais `onEdit` et `onBack` ne sont pas utilisés dans le composant |

**Problèmes :**

- **Faille XSS critique** : `dangerouslySetInnerHTML` sans aucune sanitization
- Les props `onEdit` et `onBack` sont déclarées dans l'interface mais jamais utilisées dans le JSX du composant (pas de bouton "retour" ou "modifier" affiché)
- Pas d'injection des balises `<meta>` dans le `<head>` du document (impossible pour le SSR/SEO réel)

#### E. Sitemap (`supabase/functions/sitemap/index.ts`)

**État : ~50% implémenté**

| Sous-fonctionnalité                         | État        | Détail                                     |
| ------------------------------------------- | ----------- | ------------------------------------------ |
| Génération XML du sitemap                   | ✅ Fait     | Format sitemaps.org conforme               |
| Pages publiées uniquement                   | ✅ Fait     | Filtre status = published                  |
| Lastmod                                     | ✅ Fait     | Basé sur updated_at                        |
| Cache-Control                               | ✅ Fait     | 1 heure                                    |
| Redirect Netlify                            | ✅ Fait     | `/sitemap.xml` → edge function             |
| **Inclusion/exclusion manuelle**            | ❌ Manquant | Pas de champ "exclure du sitemap"          |
| **Mise à jour automatique sur publication** | ❌ Manquant | Généré à la volée (pas un problème en soi) |
| **Priorité configurable**                   | ❌ Manquant | Toutes les pages à priority 0.8            |

---

### 3.2 Fonctionnalités totalement ABSENTES

| Module CDC                        | Fonctionnalité      | Détail                                                                          |
| --------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| **Configurateur de modèle**       | Tout le module      | Aucune table, composant ou logique pour créer des modèles de page avec sections |
| **Export de structure**           | Tout le module      | Aucune génération de JSON de structure                                          |
| **Paramètres SEO & architecture** | Hiérarchie de pages | Pas de notion de page parente                                                   |
| **Paramètres SEO & architecture** | Maillage interne    | Aucune règle mots-clés → pages cibles, aucune injection automatique de liens    |
| **Administration de publication** | Tout le module      | Pas de file d'attente, pas de cadence, pas de planification                     |
| **Authentification**              | Tout le module      | Aucune auth côté front, RLS grand ouvertes                                      |
| **Gestion des droits**            | Rôles SEO/Admin     | Aucune notion de rôle                                                           |
| **Gestion des médias**            | Upload / stockage   | Aucun système de gestion de fichiers médias                                     |
| **Routage**                       | Router applicatif   | Pas de react-router → navigation par useState                                   |

---

### 3.3 Problèmes et incohérences globales

| #      | Problème                                 | Sévérité             | Détail                                                                                                      |
| ------ | ---------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| BUG-1  | **Faille XSS** dans SEOPageViewer        | 🔴 Critique          | `dangerouslySetInnerHTML` sans sanitization                                                                 |
| BUG-2  | **Props inutilisées** dans SEOPageViewer | 🟡 Moyenne           | `onEdit` et `onBack` reçus mais pas de boutons affichés                                                     |
| BUG-3  | **CSV parser naïf**                      | 🟡 Moyenne           | Ne gère pas les champs avec virgules/guillemets                                                             |
| BUG-4  | **RLS grand ouvertes**                   | 🔴 Critique          | Tout le monde peut CRUD sans authentification                                                               |
| BUG-5  | **Pas de pagination**                    | 🟡 Moyenne           | Charge toutes les pages → crash si 300+ pages                                                               |
| BUG-6  | **Pas de routeur**                       | 🟡 Moyenne           | Navigation par useState, pas de deep linking ni back/forward                                                |
| BUG-7  | **Landing page incohérente**             | 🟠 Design            | La landing parle d'une "app de gestion de cartes de visite" (NetworkPro) alors que le projet est un CMS SEO |
| BUG-8  | **index.html title**                     | 🟡 Cosmétique        | Title = "Business Card Sales App" au lieu du nom du CMS                                                     |
| BUG-9  | **Pas de meta SEO dynamiques**           | 🔴 Critique pour SEO | Les pages publiées ne modifient pas les balises `<meta>` du `<head>`                                        |
| BUG-10 | **Domaine en dur dans le formulaire**    | 🟡 Moyenne           | L'URL de base est saisie manuellement par l'utilisateur à chaque page                                       |
