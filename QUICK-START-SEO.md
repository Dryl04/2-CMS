# Guide Rapide - Import SEO

## 🚀 Démarrage en 3 étapes

### 1️⃣ Accéder à l'outil
- Cliquez sur l'icône ⚙️ en haut à droite
- Cliquez sur "Importer"

### 2️⃣ Choisir un template ou créer vos données
**Option A - Utiliser un template (recommandé pour débuter)**
1. Cliquez sur "Utiliser un template d'exemple"
2. Choisissez le type de page qui vous convient
3. Personnalisez les valeurs
4. Cliquez sur "Valider"

**Option B - Créer manuellement**
1. Choisissez JSON ou CSV
2. Collez vos données
3. Cliquez sur "Valider"

### 3️⃣ Importer
1. Vérifiez l'aperçu
2. Cliquez sur "Importer les données"
3. ✅ C'est fait !

---

## 💡 Comprendre page_key

Le `page_key` est l'identifiant unique de votre page :

```
page_key: "home"      → Page d'accueil
page_key: "pricing"   → Page tarifs
page_key: "blog-seo"  → Article de blog sur le SEO
```

**Règles importantes :**
- ✅ Si le `page_key` n'existe pas → **Nouvelle page créée**
- ✅ Si le `page_key` existe déjà → **Page mise à jour**
- ⚠️ Utilisez des minuscules et des tirets (pas d'espaces)

---

## 📝 Templates disponibles

| Template | Usage | Exemple page_key |
|----------|-------|------------------|
| **Nouvelle page** | Page générique | `about`, `contact`, `faq` |
| **Page produit** | Fiche produit | `produit-premium`, `plan-pro` |
| **Page service** | Service professionnel | `consultation`, `formation` |
| **Article blog** | Article ou guide | `blog-titre`, `guide-2024` |
| **Pages multiples** | Import groupé | Plusieurs à la fois |

---

## ✏️ Exemple concret : Créer une page "Contact"

### Format JSON
```json
[
  {
    "page_key": "contact",
    "title": "Contactez-nous - NetworkPro | Support & Devis",
    "description": "Besoin d'aide ou d'un devis ? Notre équipe répond sous 24h. Téléphone, email, chat disponibles.",
    "keywords": ["contact", "support", "devis", "aide NetworkPro"],
    "og_title": "Contactez NetworkPro",
    "og_description": "Nous sommes là pour vous aider",
    "status": "draft"
  }
]
```

### Format CSV
```csv
page_key,title,description,keywords,og_title,og_description,status
contact,Contactez-nous - NetworkPro | Support & Devis,Besoin d'aide ou d'un devis ? Notre équipe répond sous 24h.,contact;support;devis;aide NetworkPro,Contactez NetworkPro,Nous sommes là pour vous aider,draft
```

---

## 🔄 Exemple concret : Modifier la page d'accueil

Pour modifier une page existante, utilisez le **même page_key** :

```json
[
  {
    "page_key": "home",
    "title": "NetworkPro 2024 - Nouveau titre optimisé",
    "description": "Description mise à jour avec nouveaux mots-clés.",
    "keywords": ["networking 2024", "CRM moderne", "gestion contacts"],
    "status": "published"
  }
]
```

**Résultat** : La page "home" existante sera mise à jour avec ces nouvelles valeurs.

---

## ⚡ Astuces rapides

### Créer plusieurs pages d'un coup
```json
[
  {"page_key": "page1", "title": "Titre 1", "status": "draft"},
  {"page_key": "page2", "title": "Titre 2", "status": "draft"},
  {"page_key": "page3", "title": "Titre 3", "status": "draft"}
]
```

### Passer une page de draft à published
1. Recherchez la page dans la liste
2. Cliquez sur le bouton "Publish"
3. Ou ré-importez avec `"status": "published"`

### Voir toutes vos pages
- Retournez à la liste principale
- Utilisez la recherche pour trouver rapidement
- Filtrez par statut (draft/published/archived)

---

## 🆘 Problèmes courants

| Erreur | Solution |
|--------|----------|
| "page_key est obligatoire" | Ajoutez un page_key à chaque page |
| "title est obligatoire" | Ajoutez un titre à chaque page |
| "title trop long" | Maximum 60 caractères |
| "description trop longue" | Maximum 160 caractères |
| "Erreur de format JSON" | Vérifiez vos guillemets et virgules |
| "Erreur de format CSV" | Vérifiez les en-têtes et les séparateurs |

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **SEO-TEAM-README.md** : Guide complet pour l'équipe
- **seo-import-examples.md** : Tous les exemples et bonnes pratiques
- **seo-data-example.json** : Fichier exemple JSON complet
- **seo-data-example.csv** : Fichier exemple CSV complet

---

## 🎯 Checklist avant l'import

- [ ] Mon page_key est unique et descriptif
- [ ] Mon titre fait moins de 60 caractères
- [ ] Ma description fait moins de 160 caractères
- [ ] J'ai choisi le bon statut (draft pour tester, published pour activer)
- [ ] J'ai vérifié l'aperçu avant d'importer

**Prêt à importer ? C'est parti ! 🚀**
