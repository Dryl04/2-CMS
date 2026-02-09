# Guide pour l'équipe SEO - Gestion des métadonnées

## 🎯 Vue d'ensemble

Ce système vous permet de **créer de nouvelles pages complètes** ou de **modifier des pages existantes** en gérant toutes leurs métadonnées SEO de manière centralisée. Vous pouvez importer vos données via JSON ou CSV, les valider automatiquement, et les publier en quelques clics.

### Que pouvez-vous faire avec l'import ?

1. **Créer une nouvelle page** : Définissez toutes les métadonnées SEO d'une nouvelle page de votre site
2. **Modifier une page existante** : Mettez à jour les métadonnées en important avec le même `page_key`
3. **Import en masse** : Créez ou mettez à jour plusieurs pages en une seule opération

## 🚀 Accès au système

1. **Accéder à la page de gestion SEO**
   - Cliquez sur l'icône ⚙️ (Settings) dans la navigation en haut à droite
   - Ou ajoutez `/seo` à l'URL de votre application

2. **Interface principale**
   - Liste de toutes les métadonnées existantes
   - Recherche par page_key, titre ou description
   - Filtrage par statut (draft, published, archived)
   - Bouton "Importer" pour ajouter de nouvelles données

## 📥 Import des données

### Option rapide : Utiliser un template

L'interface propose des **templates prêts à l'emploi** que vous pouvez utiliser directement :

1. Cliquez sur **"Utiliser un template d'exemple"**
2. Choisissez le type de page :
   - **Nouvelle page** : Template de base pour toute nouvelle page
   - **Page produit** : Optimisé pour présenter un produit
   - **Page service** : Adapté aux pages de services professionnels
   - **Article blog** : Structure pour articles et guides
   - **Pages multiples** : Exemple d'import de plusieurs pages à la fois
3. Le template se charge automatiquement
4. Personnalisez les données
5. Validez et importez

### Étape 1 : Préparer vos données manuellement

Vous avez deux options :

#### Option A : Format JSON
```json
[
  {
    "page_key": "home",
    "title": "Votre titre SEO",
    "description": "Votre description",
    "keywords": ["mot1", "mot2", "mot3"],
    "status": "published"
  }
]
```

#### Option B : Format CSV
```csv
page_key,title,description,keywords,status
home,Votre titre SEO,Votre description,mot1;mot2;mot3,published
```

**📁 Fichiers exemples fournis :**
- `seo-data-example.json` - Exemple complet en JSON
- `seo-data-example.csv` - Exemple complet en CSV
- `seo-import-examples.md` - Guide détaillé avec toutes les options

### Étape 2 : Importer

1. Cliquez sur le bouton **"Importer"**
2. Choisissez votre format (JSON ou CSV)
3. Collez vos données dans le champ texte
4. Cliquez sur **"Valider"**

### Étape 3 : Vérifier

Le système vérifie automatiquement :
- ✅ Présence des champs obligatoires (page_key, title)
- ✅ Longueur des titres (max 60 caractères)
- ✅ Longueur des descriptions (max 160 caractères)
- ✅ Format des statuts

Si des erreurs sont détectées, elles s'affichent avec le numéro de ligne et le champ concerné.

### Étape 4 : Aperçu et import

1. **Aperçu** : Visualisez toutes vos entrées avant l'import
2. **Import** : Cliquez sur "Importer les données" pour enregistrer
3. **Confirmation** : Un message de succès apparaît

## 📝 Gestion des métadonnées

### Rechercher
- Utilisez la barre de recherche pour trouver rapidement une page
- La recherche fonctionne sur page_key, titre et description

### Filtrer par statut
- **Draft** : Métadonnées en cours de rédaction
- **Published** : Métadonnées actives sur le site
- **Archived** : Métadonnées archivées

### Modifier le statut
Chaque carte de métadonnée dispose de boutons pour changer rapidement le statut :
- **Draft** → En cours de travail
- **Publish** → Activer sur le site
- **Archive** → Désactiver sans supprimer

### Supprimer
- Cliquez sur l'icône 🗑️ pour supprimer définitivement
- Une confirmation est demandée

## 🎨 Champs disponibles

### Obligatoires
- **page_key** : Identifiant unique (ex: home, pricing, features)
- **title** : Titre SEO de la page

### Recommandés
- **description** : Meta description (150-160 caractères idéal)
- **keywords** : Mots-clés pertinents pour la page

### Open Graph (réseaux sociaux)
- **og_title** : Titre pour Facebook, LinkedIn, etc.
- **og_description** : Description sociale
- **og_image** : Image partagée (1200x630px recommandé)

### Autres
- **canonical_url** : URL canonique
- **language** : Code langue (fr, en, etc.)
- **status** : État de publication

## 💡 Bonnes pratiques

### Titres SEO
```
✅ Bon : "NetworkPro - Transformez vos contacts en clients | CRM"
❌ Trop long : "NetworkPro - Transformez tous vos contacts professionnels en clients fidèles grâce à notre CRM mobile révolutionnaire"
```
- 50-60 caractères maximum
- Inclure la marque et le bénéfice principal
- Naturel et engageant

### Descriptions
```
✅ Bon : "Gérez vos contacts pros efficacement. Scanner de cartes, suivi auto et pipeline commercial. Essai gratuit 14j."
❌ Trop vague : "Application pour gérer des contacts"
```
- 150-160 caractères maximum
- Bénéfices clairs + appel à l'action
- Inclure 1-2 mots-clés naturellement

### Mots-clés
```
✅ Bon : ["gestion contacts", "CRM mobile", "scanner carte visite"]
❌ Trop : ["contact", "gestion", "carte", "visite", "professionnel", ...]
```
- 5-10 mots-clés maximum
- Mélange de mots-clés courts et longue traîne
- Pertinents pour la page spécifique

### Images Open Graph
- **Dimension** : 1200x630px
- **Format** : JPG ou PNG
- **Taille** : Moins de 1MB
- **Contenu** : Logo + texte court ou visuel impactant

## 🔄 Workflow recommandé

### 🆕 Créer une nouvelle page complète

Le `page_key` est l'identifiant unique de votre page. Si ce `page_key` n'existe pas encore dans le système, une nouvelle page sera créée.

**Exemple : Créer une page "À propos"**
```json
[
  {
    "page_key": "about",
    "title": "À propos de NetworkPro - Notre histoire",
    "description": "Découvrez l'équipe et la mission de NetworkPro. Nous aidons les professionnels à transformer leurs contacts en opportunités.",
    "keywords": ["à propos", "équipe NetworkPro", "mission", "valeurs"],
    "og_title": "À propos de NetworkPro",
    "og_description": "L'équipe passionnée derrière NetworkPro",
    "status": "draft"
  }
]
```

**Étapes :**
1. Choisissez un `page_key` unique et descriptif (ex: "about", "contact", "blog-seo-2024")
2. Remplissez toutes les métadonnées SEO
3. Laissez le statut en "draft" pour tester
4. Importez
5. Vérifiez dans la liste que votre page apparaît
6. Changez le statut en "published" quand prêt

### ✏️ Modifier une page existante

Pour mettre à jour une page, utilisez **exactement le même `page_key`**. Le système écrasera automatiquement les anciennes données.

**Exemple : Modifier la page d'accueil**
```json
[
  {
    "page_key": "home",
    "title": "NetworkPro - Nouveau titre optimisé SEO 2024",
    "description": "Nouvelle description plus impactante avec de meilleurs mots-clés.",
    "keywords": ["nouveaux", "mots-clés", "optimisés"],
    "status": "published"
  }
]
```

**Étapes :**
1. Cherchez le `page_key` de la page à modifier dans la liste
2. Créez votre import avec le même `page_key`
3. Modifiez uniquement les champs que vous voulez changer (tous les champs sont optionnels sauf `page_key` et `title`)
4. Importez : les nouvelles données remplacent les anciennes

**⚠️ Important** : L'import écrase complètement la page. Assurez-vous d'inclure tous les champs que vous voulez conserver.

### 📦 Import en masse (plusieurs pages à la fois)

Créez ou modifiez plusieurs pages simultanément :

```json
[
  {
    "page_key": "nouvelle-page-1",
    "title": "Première nouvelle page",
    "status": "draft"
  },
  {
    "page_key": "home",
    "title": "Modification de la page home",
    "status": "published"
  },
  {
    "page_key": "nouvelle-page-2",
    "title": "Deuxième nouvelle page",
    "status": "draft"
  }
]
```

Dans cet exemple :
- `nouvelle-page-1` et `nouvelle-page-2` seront **créées**
- `home` sera **mise à jour** (car le page_key existe déjà)

### Pour archiver

- Passer le statut en "archived" plutôt que supprimer
- Permet de réactiver facilement si besoin

## 🐛 Résolution de problèmes

### "page_key est obligatoire"
- Vérifiez que chaque ligne a bien un page_key unique
- Pas d'espaces avant/après

### "title ne doit pas dépasser 60 caractères"
- Raccourcissez votre titre
- Pensez mobile : plus court est souvent mieux

### "Erreur de format JSON"
- Vérifiez les guillemets et virgules
- Utilisez un validateur JSON en ligne
- Les tableaux doivent être entre crochets []

### "Erreur de format CSV"
- Vérifiez que la première ligne contient bien les en-têtes
- Utilisez des guillemets si votre texte contient des virgules
- Séparez les mots-clés avec `;` pas `,`

## 📊 Suivi et rapports

### Statistiques disponibles
- Nombre total de métadonnées
- Répartition par statut
- Date d'import et dernière modification

### Export
- Toutes les données sont dans Supabase
- Possibilité d'export SQL pour analyse

## 🔐 Sécurité

- Seuls les utilisateurs authentifiés peuvent importer/modifier
- Les métadonnées "published" sont publiques (normal pour le SEO)
- Les données sont sauvegardées automatiquement dans Supabase

## 📞 Support

Pour toute question ou problème :
1. Consultez d'abord `seo-import-examples.md`
2. Vérifiez les fichiers exemples fournis
3. Contactez l'équipe technique si le problème persiste

## 🎓 Ressources complémentaires

- **Guide complet** : `seo-import-examples.md`
- **Exemple JSON** : `seo-data-example.json`
- **Exemple CSV** : `seo-data-example.csv`
- **Base de données** : Table `seo_metadata` dans Supabase

---

Créé avec ❤️ pour l'équipe SEO de NetworkPro
