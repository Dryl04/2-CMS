# Guide d'import des métadonnées SEO

Ce guide explique comment importer vos métadonnées SEO via JSON ou CSV.

## Format JSON

### Structure de base
```json
[
  {
    "page_key": "home",
    "title": "NetworkPro - Transformez vos rencontres en contrats",
    "description": "L'application de gestion de cartes de visites qui transforme vos rencontres professionnelles en opportunités commerciales concrètes.",
    "keywords": ["gestion cartes visite", "networking", "CRM", "contacts professionnels"],
    "og_title": "NetworkPro - Votre réseau, votre succès",
    "og_description": "Ne perdez plus jamais une opportunité commerciale après un salon.",
    "og_image": "https://example.com/og-image.jpg",
    "canonical_url": "https://networkpro.com",
    "language": "fr",
    "status": "published"
  }
]
```

### Champs disponibles

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `page_key` | string | ✅ Oui | Identifiant unique de la page (ex: home, pricing, features) |
| `title` | string | ✅ Oui | Titre SEO (max 60 caractères recommandé) |
| `description` | string | Non | Meta description (max 160 caractères recommandé) |
| `keywords` | array | Non | Liste de mots-clés |
| `og_title` | string | Non | Titre Open Graph pour les réseaux sociaux |
| `og_description` | string | Non | Description Open Graph |
| `og_image` | string | Non | URL de l'image Open Graph (1200x630px recommandé) |
| `canonical_url` | string | Non | URL canonique de la page |
| `language` | string | Non | Code langue (fr, en, etc.) - défaut: fr |
| `status` | string | Non | Statut: draft, published, archived - défaut: draft |

### Exemple complet avec plusieurs pages
```json
[
  {
    "page_key": "home",
    "title": "NetworkPro - Transformez vos rencontres en contrats",
    "description": "L'application de gestion de cartes de visites qui transforme vos rencontres en opportunités commerciales.",
    "keywords": ["gestion cartes visite", "networking", "CRM"],
    "og_title": "NetworkPro - Votre réseau, votre succès",
    "og_description": "Ne perdez plus jamais une opportunité commerciale",
    "og_image": "https://example.com/og-home.jpg",
    "status": "published"
  },
  {
    "page_key": "pricing",
    "title": "Tarifs NetworkPro - Plans adaptés à votre croissance",
    "description": "Découvrez nos offres flexibles pour digitaliser votre réseau professionnel. Essai gratuit sans engagement.",
    "keywords": ["tarifs CRM", "prix gestion contacts", "abonnement networking"],
    "og_title": "Tarifs NetworkPro - À partir de 0€",
    "og_description": "Des plans adaptés à chaque professionnel",
    "status": "published"
  },
  {
    "page_key": "features",
    "title": "Fonctionnalités NetworkPro - CRM Mobile Complet",
    "description": "Scanner de cartes, gestion d'événements, pipeline commercial, notifications intelligentes et plus encore.",
    "keywords": ["fonctionnalités CRM", "scanner cartes visite", "gestion événements"],
    "status": "draft"
  }
]
```

## Format CSV

### Structure de base
```csv
page_key,title,description,keywords,og_title,og_description,og_image,canonical_url,language,status
home,NetworkPro - Transformez vos rencontres en contrats,L'application de gestion de cartes de visites,gestion cartes visite;networking;CRM,NetworkPro - Votre réseau,Ne perdez plus jamais une opportunité,https://example.com/og.jpg,https://networkpro.com,fr,published
pricing,Tarifs NetworkPro - Plans adaptés,Découvrez nos offres flexibles,tarifs CRM;prix gestion contacts,Tarifs NetworkPro,Des plans adaptés,,,,published
```

### Notes importantes pour CSV

1. **Séparateur de mots-clés**: Utilisez le point-virgule `;` pour séparer les mots-clés dans la colonne keywords
   - ✅ Correct: `gestion cartes visite;networking;CRM`
   - ❌ Incorrect: `gestion cartes visite,networking,CRM`

2. **Champs vides**: Laissez simplement vide entre les virgules
   - Exemple: `home,Titre,Description,,,,,,fr,published`

3. **Guillemets**: Utilisez des guillemets si votre texte contient des virgules
   - Exemple: `"Titre avec, des virgules"`

### Template CSV à copier
```csv
page_key,title,description,keywords,og_title,og_description,og_image,canonical_url,language,status
home,Votre titre SEO,Votre description SEO,mot1;mot2;mot3,Titre OG,Description OG,https://example.com/image.jpg,https://example.com,fr,draft
```

## Validation automatique

Le système vérifie automatiquement :
- ✅ Présence obligatoire de `page_key` et `title`
- ✅ Longueur du titre (recommandé max 60 caractères)
- ✅ Longueur de la description (recommandé max 160 caractères)
- ✅ Format du statut (draft, published, ou archived)
- ✅ Unicité du `page_key` (les doublons écraseront les anciennes valeurs)

## Bonnes pratiques SEO

### Titres (title)
- **Longueur**: 50-60 caractères
- **Format**: Marque + Bénéfice principal + Mot-clé
- **Exemple**: "NetworkPro - Transformez vos contacts en clients | CRM Mobile"

### Descriptions (description)
- **Longueur**: 150-160 caractères
- **Contenu**: Bénéfices clairs, appel à l'action, mots-clés naturels
- **Exemple**: "Gérez vos contacts professionnels efficacement. Scanner de cartes, suivi automatisé et pipeline commercial. Essai gratuit 14 jours."

### Mots-clés (keywords)
- **Nombre**: 5-10 mots-clés pertinents
- **Types**: Mots-clés principaux + longue traîne + variations
- **Exemple**: ["gestion contacts", "CRM mobile", "scanner carte visite", "networking professionnel"]

### Open Graph (og_*)
- **Image**: 1200x630px, max 1MB, format JPG ou PNG
- **Titre**: Peut être plus accrocheur que le titre SEO
- **Description**: Peut être plus émotionnelle

## Workflow recommandé

1. **Préparation**: Créez vos métadonnées dans un tableur (Excel, Google Sheets)
2. **Export CSV**: Exportez en CSV avec les colonnes exactes
3. **Validation**: Collez dans l'interface et cliquez sur "Valider"
4. **Correction**: Corrigez les erreurs signalées
5. **Import**: Cliquez sur "Importer" une fois validé
6. **Publication**: Changez le statut de "draft" à "published" quand prêt

## Support

Pour toute question sur l'import des métadonnées SEO, contactez votre équipe technique.
