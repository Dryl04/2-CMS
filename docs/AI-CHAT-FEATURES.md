# 🤖 Assistant IA - Nouvelles Fonctionnalités

## Vue d'ensemble

Le chat IA a été complètement refactorisé avec une interface inspirée de GitHub Copilot pour offrir une meilleure expérience utilisateur et plus de contrôle sur le contenu généré.

## ✨ Nouvelles Fonctionnalités

### 1. **Gestion avancée du contenu généré**

Trois actions sont maintenant disponibles pour chaque suggestion de l'IA :

#### 🧪 **Tester**
- Insère le code dans l'éditeur pour le visualiser
- Le message reste dans le chat avec un badge "Testé"
- Permet de voir le rendu avant de l'accepter définitivement
- Idéal pour comparer plusieurs versions

#### ✅ **Accepter**
- Applique le code à l'éditeur
- Supprime le message du chat pour garder une conversation propre
- Confirme l'acceptation définitive du contenu

#### ❌ **Refuser**
- Supprime le message du chat
- Permet de rejeter une suggestion qui ne convient pas
- Garde l'historique de conversation propre

#### ➕ **Ajouter**
- Ajoute le contenu à la suite du contenu existant
- Utile pour construire progressivement une page
- Ne supprime pas le message du chat

### 2. **Options de contexte avancées**

#### 📊 **Inclusion des métadonnées SEO**
- Option pour inclure ou exclure les métadonnées SEO du contexte
- L'IA prend en compte le titre, la description et les mots-clés
- Permet une génération de contenu optimisé pour le référencement

#### 🎯 **Scope de modification du contenu**

Trois modes disponibles :

- **HTML uniquement** : Modifie seulement la structure et le style
  - Garde le texte intact
  - Idéal pour changer le design sans toucher au contenu SEO

- **Texte uniquement** : Optimise le texte pour le SEO
  - Garde la structure HTML intacte
  - Parfait pour améliorer le contenu sans changer le layout

- **Les deux** : Modification complète
  - HTML et texte peuvent être modifiés
  - Mode par défaut pour une refonte complète

### 3. **Améliorations UI/UX**

#### 🎨 **Design modernisé**
- Interface inspirée de GitHub Copilot
- Dégradés de couleurs pour un look plus moderne
- Animations fluides et transitions élégantes
- Badges et indicateurs d'état visuels

#### 📱 **Responsive Design**
- S'adapte automatiquement aux petits écrans
- Interface optimisée mobile et desktop
- Gestion intelligente de l'espace disponible

#### 🔤 **Gestion du texte**
- Troncature automatique pour les longs messages
- Scroll dans les zones de contenu
- Auto-resize du textarea d'input
- Preview du code avec limitation de hauteur

#### 🎯 **Expérience utilisateur**
- Suggestions contextuelles par type de section
- Messages d'aide et tooltips explicites
- Feedback visuel pour chaque action
- États de chargement clairs

### 4. **Configuration personnalisée**

#### 🔧 **Modèles IA personnalisés**
- Support de modèles custom (GitHub Models, OpenRouter, etc.)
- Gestion facile des clés API
- Interface d'ajout/suppression intuitive

#### 💾 **Stockage local sécurisé**
- Clés API stockées en local dans le navigateur
- Configuration persistante entre les sessions
- Pas d'envoi des clés au serveur

## 🎓 Guide d'utilisation

### Workflow recommandé pour le contenu existant

1. **Configurer le scope** :
   - Cliquez sur l'icône `Layers` dans le header
   - Choisissez si vous voulez modifier le HTML, le texte, ou les deux
   - Activez/désactivez l'inclusion des métadonnées SEO

2. **Demander une génération** :
   - Décrivez ce que vous voulez modifier
   - L'IA prendra en compte vos paramètres de scope

3. **Tester la suggestion** :
   - Cliquez sur "Tester" pour voir le rendu
   - Le contenu est appliqué mais reste dans le chat
   - Vous pouvez demander des ajustements

4. **Accepter ou refuser** :
   - Si ça convient : cliquez sur "Accepter"
   - Sinon : cliquez sur "Refuser" et demandez autre chose

### Exemples d'utilisation

#### Exemple 1 : Améliorer uniquement le texte SEO
```
Scope : Texte uniquement
Contexte SEO : Activé

Prompt : "Réécris le texte pour mieux cibler le mot-clé 'marketing digital'"
→ L'IA modifie le texte sans toucher au HTML
```

#### Exemple 2 : Changer le design sans toucher au contenu
```
Scope : HTML uniquement
Contexte SEO : Désactivé (non nécessaire)

Prompt : "Transforme cette section en un layout en grille 2x2 avec des cartes"
→ L'IA modifie la structure HTML/CSS mais garde le texte
```

#### Exemple 3 : Refonte complète
```
Scope : Les deux
Contexte SEO : Activé

Prompt : "Crée un hero moderne avec gradient, optimisé pour 'agence web'"
→ L'IA génère du nouveau HTML et du nouveau texte optimisé
```

## 🛡️ Bonnes pratiques

### Gestion des erreurs
- L'interface gère automatiquement les débordements de texte
- Les messages d'erreur sont clairs et explicites
- Les états de chargement sont toujours visibles

### Performance
- Le contexte envoyé à l'IA est limité (2000 caractères max)
- Les previews de code sont tronquées pour ne pas surcharger l'interface
- Le scroll est optimisé pour de longues conversations

### Sécurité
- Les clés API ne sont jamais envoyées au serveur
- Stockage uniquement en localStorage du navigateur
- Aucune donnée sensible n'est logguée

## 🔄 Évolutions futures possibles

- [ ] Historique des versions avec possibilité de restaurer
- [ ] Export/import de conversations
- [ ] Templates de prompts personnalisés
- [ ] Multi-sélection de messages pour comparaison
- [ ] Preview visuel du rendu dans le chat
- [ ] Suggestions automatiques basées sur le contenu existant
- [ ] Intégration avec des outils d'analyse SEO

## 📝 Notes techniques

### Props du composant

```typescript
interface AIContentChatProps {
  currentContent: string;          // Contenu HTML actuel
  onApplyContent: (html: string) => void;  // Callback pour appliquer le contenu
  currentSectionType?: SectionType;  // Type de section pour suggestions contextuelles
  seoMetadata?: {                   // Métadonnées SEO (optionnel)
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
```

### États internes

- `includeSEO` : Booléen pour inclure/exclure les métadonnées SEO
- `contentScope` : 'html' | 'text' | 'both' - Définit la portée des modifications
- `tested` : Flag sur chaque message pour savoir si le code a été testé

### Contexte envoyé à l'IA

Le contexte est construit dynamiquement selon les options :
- Contenu HTML actuel (si existe et selon le scope)
- Instructions spécifiques selon le scope choisi
- Métadonnées SEO (si activées)
- Limité à 2000 caractères pour optimiser les performances
