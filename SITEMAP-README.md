# Système de Sitemap Dynamique

## Vue d'ensemble

Le sitemap est généré automatiquement à partir des pages SEO publiées dans votre base de données Supabase.

## Accès au Sitemap

Le sitemap XML est accessible à l'URL :
```
https://votre-domaine.com/sitemap.xml
```

## Fonctionnement

1. **Edge Function Supabase** : Une fonction serverless (`supabase/functions/sitemap/index.ts`) génère le sitemap en temps réel
2. **Récupération automatique** : La fonction interroge la table `seo_metadata` pour toutes les pages avec `status = 'published'`
3. **Format XML** : Génère un sitemap XML valide selon les standards de Google
4. **Cache** : Le sitemap est mis en cache pendant 1 heure pour optimiser les performances

## Contenu du Sitemap

Le sitemap inclut :
- La page d'accueil (priorité 1.0)
- Toutes les pages SEO publiées (priorité 0.8)
- La date de dernière modification de chaque page
- La fréquence de mise à jour suggérée

## Structure XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://votre-domaine.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://votre-domaine.com/page-key</loc>
    <lastmod>2026-02-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Soumission aux moteurs de recherche

### Google Search Console
1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Sélectionnez votre propriété
3. Dans le menu, cliquez sur "Sitemaps"
4. Ajoutez l'URL : `sitemap.xml`
5. Cliquez sur "Envoyer"

### Bing Webmaster Tools
1. Allez sur [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sélectionnez votre site
3. Cliquez sur "Sitemaps"
4. Ajoutez l'URL : `https://votre-domaine.com/sitemap.xml`
5. Cliquez sur "Soumettre"

## Mise à jour automatique

Le sitemap se met à jour automatiquement lorsque :
- Une nouvelle page est publiée (`status = 'published'`)
- Une page existante est modifiée (mise à jour de `updated_at`)
- Une page est archivée ou supprimée

Aucune action manuelle n'est requise.

## Vérification

Pour vérifier que votre sitemap fonctionne :
1. Visitez `https://votre-domaine.com/sitemap.xml` dans votre navigateur
2. Vous devriez voir un document XML avec toutes vos pages
3. Utilisez [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html) pour valider

## Optimisation SEO

Pour maximiser l'impact SEO :
- Publiez régulièrement du nouveau contenu
- Mettez à jour vos pages existantes
- Assurez-vous que toutes les pages importantes ont `status = 'published'`
- Vérifiez que les `page_key` sont des slugs SEO-friendly (ex: "guide-networking" plutôt que "page123")
