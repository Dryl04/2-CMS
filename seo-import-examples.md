# Guide d'import des métadonnées SEO

Ce guide explique comment importer vos métadonnées SEO via JSON ou CSV.

## Format JSON

### Structure de base
```json
[
  {
    "page_key": "home",
    "slug": "home",
    "title": "NetworkPro - Transformez vos rencontres en contrats",
    "meta_description": "L'application de gestion de cartes de visites qui transforme vos rencontres professionnelles en opportunités commerciales concrètes.",
    "keywords": ["gestion cartes visite", "networking", "CRM", "contacts professionnels"],
    "h1": "NetworkPro - Votre réseau, votre succès",
    "h2": "Transformez chaque rencontre en opportunité",
    "content": "<p>Ne perdez plus jamais une opportunité commerciale après un salon.</p>",
    "status": "published",
    "parent_page_key": null
  }
]
```

### Champs disponibles

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `page_key` | string | ✅ Oui | Identifiant unique de la page (ex: home, pricing, features) |
| `slug` | string | ✅ Oui | URL de la page (ex: home, blog/article-1) - généré automatiquement depuis le titre si absent |
| `title` | string | ✅ Oui | Titre SEO (max 60 caractères recommandé) |
| `meta_description` | string | ✅ Oui | Meta description (max 160 caractères recommandé) |
| `keywords` | array | Non | Liste de mots-clés |
| `h1` | string | Non | Titre principal H1 de la page |
| `h2` | string | Non | Sous-titre H2 de la page |
| `content` | string | Non | Contenu HTML de la page |
| `canonical_url` | string | Non | URL canonique de la page |
| `status` | string | Non | Statut: draft, pending, published, archived - défaut: draft |
| `parent_page_key` | string | Non | Clé de la page parente pour créer une hiérarchie (ex: blog pour blog/article) |

### Exemple complet avec plusieurs pages et hiérarchie
```json
[
  {
    "page_key": "home",
    "slug": "home",
    "title": "NetworkPro - Transformez vos rencontres en contrats",
    "meta_description": "L'application de gestion de cartes de visites qui transforme vos rencontres en opportunités commerciales.",
    "keywords": ["gestion cartes visite", "networking", "CRM"],
    "h1": "NetworkPro - Votre réseau, votre succès",
    "content": "<p>Ne perdez plus jamais une opportunité commerciale</p>",
    "status": "published",
    "parent_page_key": null
  },
  {
    "page_key": "blog",
    "slug": "blog",
    "title": "Blog NetworkPro - Conseils et stratégies",
    "meta_description": "Découvrez nos conseils pour optimiser votre networking professionnel.",
    "keywords": ["blog networking", "conseils CRM"],
    "status": "published",
    "parent_page_key": null
  },
  {
    "page_key": "blog-article-1",
    "slug": "blog/comment-reussir-networking",
    "title": "Comment réussir son networking en 2026",
    "meta_description": "Découvrez les meilleures stratégies pour développer votre réseau professionnel.",
    "keywords": ["networking 2026", "stratégies réseau"],
    "h1": "Comment réussir son networking en 2026",
    "content": "<p>Le networking est un art qui demande de la stratégie...</p>",
    "status": "published",
    "parent_page_key": "blog"
  }
]
```

## Format CSV

### Structure de base
```csv
page_key,slug,title,meta_description,keywords,h1,h2,content,status,parent_page_key
home,home,NetworkPro - Transformez vos rencontres en contrats,L'application de gestion de cartes de visites,gestion cartes visite;networking;CRM,NetworkPro - Votre réseau,Transformez chaque rencontre,<p>Ne perdez plus jamais une opportunité</p>,published,
blog,blog,Blog NetworkPro - Conseils et stratégies,Découvrez nos conseils pour optimiser votre networking,blog networking;conseils CRM,Blog NetworkPro,Les meilleures pratiques,<p>Conseils networking</p>,published,
blog-article-1,blog/comment-reussir-networking,Comment réussir son networking en 2026,Découvrez les meilleures stratégies,networking 2026;stratégies réseau,Comment réussir son networking,Les stratégies gagnantes,<p>Le networking...</p>,published,blog
```

### Notes importantes pour CSV

1. **Séparateur de mots-clés**: Utilisez le point-virgule `;` pour séparer les mots-clés dans la colonne keywords
   - ✅ Correct: `gestion cartes visite;networking;CRM`
   - ❌ Incorrect: `gestion cartes visite,networking,CRM`

2. **Champs vides**: Laissez simplement vide entre les virgules
   - Exemple: `home,home,Titre,Description,keywords,,,<p>contenu</p>,published,`

3. **Guillemets**: Utilisez des guillemets si votre texte contient des virgules
   - Exemple: `"Titre avec, des virgules"`

4. **Hiérarchie des pages**: Utilisez `parent_page_key` pour créer une arborescence
   - La page parente doit exister dans l'import ou dans la base
   - Ex: article avec `parent_page_key=blog` créera la hiérarchie Blog > Article

### Template CSV à copier
```csv
page_key,slug,title,meta_description,keywords,h1,h2,content,status,parent_page_key
home,home,Votre titre SEO,Votre description SEO,mot1;mot2;mot3,Titre H1,Sous-titre H2,<p>Contenu HTML</p>,draft,
```

## Validation automatique

Le système vérifie automatiquement :
- ✅ Présence obligatoire de `page_key`, `slug`, `title` et `meta_description`
- ✅ Longueur du titre (recommandé max 60 caractères)
- ✅ Longueur de la meta description (recommandé max 160 caractères)
- ✅ Format du slug (a-z, 0-9, -, /)
- ✅ Format du statut (draft, pending, published, ou archived)
- ✅ Unicité du `page_key` et du `slug` (les doublons écraseront les anciennes valeurs)
- ✅ Validation des relations parent-enfant (détection des références circulaires)
- ✅ Existence de la page parente dans l'import ou dans la base

## Bonnes pratiques SEO

### Titres (title)
- **Longueur**: 50-60 caractères
- **Format**: Marque + Bénéfice principal + Mot-clé
- **Exemple**: "NetworkPro - Transformez vos contacts en clients | CRM Mobile"

### Meta descriptions (meta_description)
- **Longueur**: 150-160 caractères
- **Contenu**: Bénéfices clairs, appel à l'action, mots-clés naturels
- **Exemple**: "Gérez vos contacts professionnels efficacement. Scanner de cartes, suivi automatisé et pipeline commercial. Essai gratuit 14 jours."

### Slugs (slug)
- **Format**: Utiliser des tirets (-) pour séparer les mots
- **Hiérarchie**: Utiliser des slashes (/) pour les pages enfants (ex: blog/article-1)
- **Caractères**: Minuscules, a-z, 0-9, tirets et slashes uniquement
- **Exemple**: `blog/comment-reussir-networking-2026`

### Mots-clés (keywords)
- **Nombre**: 5-10 mots-clés pertinents
- **Types**: Mots-clés principaux + longue traîne + variations
- **Exemple**: ["gestion contacts", "CRM mobile", "scanner carte visite", "networking professionnel"]

### Hiérarchie des pages (parent_page_key)
- **Usage**: Créer une structure logique (ex: Blog > Articles)
- **SEO**: Aide à organiser le sitemap et la navigation
- **URLs**: Les slugs peuvent refléter la hiérarchie (ex: blog/article)
- **Exemple**: Page "blog-article-1" avec parent_page_key="blog"

## Workflow recommandé

1. **Préparation**: Créez vos métadonnées dans un tableur (Excel, Google Sheets)
2. **Export CSV**: Exportez en CSV avec les colonnes exactes
3. **Validation**: Collez dans l'interface et vérifiez les erreurs automatiquement
4. **Correction**: Corrigez les erreurs signalées (blocking et warnings)
5. **Import**: Cliquez sur "Importer" une fois validé
6. **Publication**: Changez le statut de "draft" à "published" quand prêt

## Support

Pour toute question sur l'import des métadonnées SEO, contactez votre équipe technique.
