# Étape 1 — Liste complète des fonctionnalités et pages requises

> Basé sur le cahier des charges fonctionnel : _Application de génération et publication massive de pages web via JSON_

---

## 1. Pages / Modules de l'application

| #   | Page / Module                             | Finalité principale                                               |
| --- | ----------------------------------------- | ----------------------------------------------------------------- |
| P1  | **Tableau de bord**                       | Vue synthétique de toutes les pages générées et de leur statut    |
| P2  | **Configurateur de modèle**               | Création de structures de pages (sections visuelles, contraintes) |
| P3  | **Export de structure**                   | Génération et téléchargement du modèle JSON vierge                |
| P4  | **Import de contenu**                     | Import et validation de fichiers JSON complétés                   |
| P5  | **Éditeur de page**                       | Modification manuelle des contenus et métadonnées par page        |
| P6  | **Paramètres SEO & architecture**         | Hiérarchie des pages, maillage interne, sitemap                   |
| P7  | **Administration de publication**         | Planification et file d'attente de publication                    |
| P8  | **Authentification & gestion des droits** | Connexion, rôles (SEO, administrateur)                            |

---

## 2. Fonctionnalités détaillées par module

### P1 — Tableau de bord

| #    | Fonctionnalité                                                         | Priorité |
| ---- | ---------------------------------------------------------------------- | -------- |
| F1.1 | Affichage de la liste paginée des pages générées                       | Haute    |
| F1.2 | Indication du statut par page : brouillon, en attente, publiée, erreur | Haute    |
| F1.3 | Filtrage par statut                                                    | Haute    |
| F1.4 | Recherche sur les pages (titre, slug, description)                     | Haute    |
| F1.5 | Accès à l'édition individuelle d'une page                              | Haute    |
| F1.6 | Compteurs de synthèse (nombre de pages par statut)                     | Moyenne  |

### P2 — Configurateur de modèle

| #    | Fonctionnalité                                                                   | Priorité |
| ---- | -------------------------------------------------------------------------------- | -------- |
| F2.1 | Catalogue de sections visuelles prédéfinies (hero, texte, image, CTA, FAQ, etc.) | Haute    |
| F2.2 | Sélection et ajout de sections à un modèle                                       | Haute    |
| F2.3 | Ordonnancement des sections (drag & drop)                                        | Haute    |
| F2.4 | Définition des contraintes par section : nombre min/max de mots                  | Haute    |
| F2.5 | Définition de la présence obligatoire ou facultative d'une section               | Haute    |
| F2.6 | Enregistrement du modèle (nom, description, sections)                            | Haute    |
| F2.7 | Liste des modèles enregistrés                                                    | Moyenne  |
| F2.8 | Duplication / suppression d'un modèle                                            | Moyenne  |

### P3 — Export de structure

| #    | Fonctionnalité                                                   | Priorité |
| ---- | ---------------------------------------------------------------- | -------- |
| F3.1 | Génération d'un fichier JSON décrivant la structure des sections | Haute    |
| F3.2 | Inclusion des emplacements de contenus dans le JSON              | Haute    |
| F3.3 | Inclusion des contraintes associées (mots min/max, obligatoire)  | Haute    |
| F3.4 | Téléchargement du fichier JSON                                   | Haute    |

### P4 — Import de contenu

| #    | Fonctionnalité                                     | Priorité |
| ---- | -------------------------------------------------- | -------- |
| F4.1 | Import d'un ou plusieurs fichiers JSON complétés   | Haute    |
| F4.2 | Import via CSV (en supplément)                     | Moyenne  |
| F4.3 | Validation de la conformité au modèle (structure)  | Haute    |
| F4.4 | Validation des champs obligatoires                 | Haute    |
| F4.5 | Validation des contraintes de longueur             | Haute    |
| F4.6 | Rapport d'erreurs bloquantes et non bloquantes     | Haute    |
| F4.7 | Aperçu des données avant import                    | Haute    |
| F4.8 | Sécurisation des imports : taille, type, structure | Haute    |
| F4.9 | Prévention des doublons de slug / page_key         | Haute    |

### P5 — Éditeur de page

| #     | Fonctionnalité                                                 | Priorité |
| ----- | -------------------------------------------------------------- | -------- |
| F5.1  | Modification du contenu textuel par section                    | Haute    |
| F5.2  | Gestion des médias : ajout, remplacement, suppression d'images | Haute    |
| F5.3  | Gestion des vidéos : ajout, remplacement, suppression          | Moyenne  |
| F5.4  | Définition d'images de fond par section                        | Moyenne  |
| F5.5  | Édition du titre de la page                                    | Haute    |
| F5.6  | Édition du meta title                                          | Haute    |
| F5.7  | Édition de la meta description                                 | Haute    |
| F5.8  | Édition du slug                                                | Haute    |
| F5.9  | Édition du contenu Open Graph (titre, description, image)      | Moyenne  |
| F5.10 | Prévisualisation de la page rendue                             | Haute    |

### P6 — Paramètres SEO & architecture

| #    | Fonctionnalité                                                        | Priorité |
| ---- | --------------------------------------------------------------------- | -------- |
| F6.1 | Définition de la page parente (hiérarchie)                            | Haute    |
| F6.2 | Paramétrage des règles de maillage interne (mots-clés → pages cibles) | Haute    |
| F6.3 | Application automatique du maillage interne dans le contenu           | Haute    |
| F6.4 | Gestion du sitemap : inclusion/exclusion de pages                     | Haute    |
| F6.5 | Mise à jour automatique du sitemap à chaque publication               | Haute    |
| F6.6 | URL canonique automatique                                             | Moyenne  |

### P7 — Administration de publication

| #    | Fonctionnalité                                  | Priorité |
| ---- | ----------------------------------------------- | -------- |
| F7.1 | Définition du nombre de pages publiées par jour | Haute    |
| F7.2 | Gestion de la file d'attente de publication     | Haute    |
| F7.3 | Activation / suspension du processus automatisé | Haute    |
| F7.4 | Visualisation de la file d'attente (planning)   | Haute    |
| F7.5 | Publication progressive selon cadence définie   | Haute    |
| F7.6 | Publication manuelle immédiate d'une page       | Moyenne  |

### P8 — Authentification & gestion des droits

| #    | Fonctionnalité                                       | Priorité |
| ---- | ---------------------------------------------------- | -------- |
| F8.1 | Connexion / inscription utilisateur                  | Haute    |
| F8.2 | Rôles : SEO (lecture/édition), Administrateur (tout) | Haute    |
| F8.3 | Protection des routes et actions API                 | Haute    |
| F8.4 | Gestion de session / déconnexion                     | Haute    |

---

## 3. Fonctionnalités transversales

| #    | Fonctionnalité                                | Priorité |
| ---- | --------------------------------------------- | -------- |
| FT.1 | Validation stricte des fichiers JSON importés | Haute    |
| FT.2 | Gestion des erreurs de traitement en masse    | Haute    |
| FT.3 | Performance → support de centaines de pages   | Haute    |
| FT.4 | Compatibilité navigateurs modernes            | Haute    |
| FT.5 | Prévention des doublons de slug               | Haute    |
| FT.6 | Routage SPA avec gestion des URL dynamiques   | Haute    |
| FT.7 | Génération automatique des liens internes     | Haute    |
| FT.8 | Mise à jour automatique du sitemap            | Haute    |

---

## 4. KPI attendus (rappel cahier des charges)

- Publication de **300 pages en une semaine**
- Réduction significative du temps de mise en ligne par page
- Suppression de la saisie manuelle du maillage interne
- Mise à jour automatique du sitemap sans intervention humaine
- Centralisation complète des contenus, médias et paramètres SEO
