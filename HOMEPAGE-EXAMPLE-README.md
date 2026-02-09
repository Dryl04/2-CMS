# Exemple de Page Complète (JSON + HTML)

## Fichier : homepage-example.json

Ce fichier contient un exemple complet d'une page identique à la page d'accueil, avec toutes les métadonnées SEO et le contenu HTML intégré.

## Structure de l'exemple

### Métadonnées SEO

```json
{
  "page_key": "accueil",
  "title": "Titre optimisé SEO avec mots-clés",
  "description": "Description méta optimisée pour les moteurs de recherche",
  "keywords": ["mot-clé 1", "mot-clé 2", "..."],
  "canonical_url": "https://votresite.com/",
  "language": "fr",
  "og_title": "Titre pour les réseaux sociaux",
  "og_description": "Description pour les réseaux sociaux",
  "og_image": "URL de l'image de partage",
  "status": "published"
}
```

### Contenu HTML

Le champ `content` contient le HTML complet de la page, incluant :
- Section hero avec titre et call-to-action
- Statistiques et preuves sociales
- Comparaison Avant/Après
- Sections de contenu persuasif
- Fonctionnalités du produit
- Appel à l'action final

## Comment utiliser cet exemple

### Option 1 : Import via l'interface SEO Manager

1. Allez dans l'interface de gestion SEO (icône engrenage)
2. Cliquez sur "Importer des pages"
3. Sélectionnez le fichier `homepage-example.json`
4. La page sera importée avec toutes ses métadonnées

### Option 2 : Import via SQL

```sql
INSERT INTO seo_metadata (
  page_key, title, description, keywords,
  canonical_url, language, og_title, og_description,
  og_image, status, content
) VALUES (
  'accueil',
  'Transformez vos rencontres en contrats - Application gestion cartes de visite professionnelles',
  'Ne perdez plus jamais une opportunité commerciale après un salon...',
  ARRAY['application gestion cartes de visite', 'scanner carte de visite', 'CRM mobile'],
  'https://votresite.com/',
  'fr',
  'NetworkPro - Transformez vos rencontres en contrats',
  'L''application qui transforme vos cartes de visite en opportunités commerciales.',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
  'published',
  '<section class="pb-24 bg-white">...</section>'
);
```

### Option 3 : API REST

```bash
curl -X POST 'https://votre-projet.supabase.co/rest/v1/seo_metadata' \
  -H "apikey: VOTRE_ANON_KEY" \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d @homepage-example.json
```

## Personnalisation

Pour créer vos propres pages basées sur cet exemple :

1. **Copiez le fichier JSON**
2. **Modifiez les métadonnées** :
   - `page_key` : slug unique de la page (ex: "a-propos", "contact")
   - `title` : titre unique optimisé pour le SEO
   - `description` : description unique
   - `keywords` : mots-clés pertinents pour cette page
   - `canonical_url` : URL complète de la page

3. **Modifiez le contenu HTML** :
   - Remplacez le texte par votre propre contenu
   - Gardez la structure HTML et les classes Tailwind CSS
   - Utilisez les mêmes composants visuels pour la cohérence

## Structure du HTML inclus

Le HTML suit ces bonnes pratiques :
- **Sections sémantiques** : `<section>`, `<div>`, `<h1>-<h6>`
- **Classes Tailwind CSS** : Styling cohérent avec le reste du site
- **Responsive** : Grid layout qui s'adapte aux mobiles
- **Accessibilité** : Structure sémantique correcte
- **Performance** : Pas de JavaScript inline, SVG optimisés

## Classes CSS principales utilisées

```css
/* Containers */
max-w-7xl mx-auto px-6

/* Spacing */
py-32 (padding vertical)
mb-8 (margin bottom)

/* Typography */
text-5xl font-serif font-bold
text-xl text-gray-600

/* Grid & Flex */
grid md:grid-cols-2 lg:grid-cols-3 gap-8
flex items-center justify-center

/* Couleurs */
bg-white, bg-gray-50, bg-gray-900
text-gray-900, text-gray-600
```

## Bonnes pratiques SEO intégrées

✅ **Titre unique** : Chaque page doit avoir un titre unique
✅ **Description unique** : Pas de duplicate content
✅ **Mots-clés ciblés** : Liste de mots-clés pertinents
✅ **URL canonique** : Évite le duplicate content
✅ **Open Graph** : Optimisé pour le partage social
✅ **Contenu riche** : HTML sémantique et structuré
✅ **Hiérarchie des titres** : H1, H2, H3 dans l'ordre

## Affichage de la page

Quand un utilisateur visite `https://votre-site.com/accueil` :

1. L'application charge les données depuis `seo_metadata`
2. Le composant `SEOPageViewer` affiche :
   - **Header** (identique à la page d'accueil)
   - **Contenu HTML** (du champ `content`)
   - **Footer** (identique à la page d'accueil)

## Exemple de pages à créer

Basé sur ce template, vous pouvez créer :
- `/a-propos` - Page à propos
- `/fonctionnalites` - Détails des fonctionnalités
- `/tarifs` - Page de tarification
- `/contact` - Page de contact
- `/blog/article-1` - Articles de blog
- `/guide-networking` - Guides et ressources

Chaque page aura l'en-tête et le pied de page identiques, avec son propre contenu au milieu.
