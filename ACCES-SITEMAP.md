# Accès au Sitemap - Guide Rapide

## URL du Sitemap

Votre sitemap XML est accessible à l'adresse :

```
https://votre-domaine.com/sitemap.xml
```

## Fonctionnement

Le sitemap est généré dynamiquement par une **Supabase Edge Function** qui :
1. Récupère toutes les pages avec `status = 'published'` depuis la base de données
2. Génère un fichier XML au format standard Google
3. Inclut la page d'accueil et toutes les pages SEO publiées
4. Se met à jour automatiquement quand vous publiez de nouvelles pages

## Exemple de contenu

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://votre-domaine.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://votre-domaine.com/accueil</loc>
    <lastmod>2026-02-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://votre-domaine.com/lamont</loc>
    <lastmod>2026-02-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Comment l'utiliser

### 1. Vérification locale
Visitez simplement `https://votre-domaine.com/sitemap.xml` dans votre navigateur

### 2. Soumission à Google
1. Connectez-vous à [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre site si ce n'est pas déjà fait
3. Dans le menu latéral, cliquez sur **"Sitemaps"**
4. Entrez `sitemap.xml` dans le champ
5. Cliquez sur **"Envoyer"**

### 3. Soumission à Bing
1. Connectez-vous à [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Ajoutez votre site
3. Allez dans **"Sitemaps"**
4. Ajoutez l'URL complète : `https://votre-domaine.com/sitemap.xml`
5. Cliquez sur **"Soumettre"**

## Mise à jour automatique

Aucune action manuelle requise ! Le sitemap se met à jour automatiquement quand :
- ✅ Vous publiez une nouvelle page (changez le `status` à `'published'`)
- ✅ Vous modifiez une page existante (la date `updated_at` est mise à jour)
- ✅ Vous archivez une page (changez le `status` à `'archived'`)

## Fichiers liés

- **Edge Function** : `supabase/functions/sitemap/index.ts`
- **Redirection** : `public/_redirects` et `dist/_redirects`
- **Documentation complète** : `SITEMAP-README.md`

## Support

Pour plus de détails sur le fonctionnement technique, consultez `SITEMAP-README.md`.
