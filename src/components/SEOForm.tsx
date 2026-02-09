import { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, Globe, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SEOFormProps {
  onSaveComplete: () => void;
  editingPage?: any;
}

const TEMPLATE_PRESETS = {
  nouvelle_page: {
    name: "Page générique",
    title: "Titre de votre page (max 60 caractères)",
    description: "Description qui apparaîtra dans Google (max 160 caractères recommandé)",
    keywords: ["mot-clé 1", "mot-clé 2", "mot-clé 3"]
  },
  page_produit: {
    name: "Page produit",
    title: "Nom du Produit - Bénéfice Principal | Votre Marque",
    description: "Découvrez notre produit révolutionnaire. Fonctionnalité 1, fonctionnalité 2. Essai gratuit disponible.",
    keywords: ["nom produit", "catégorie produit", "solution"]
  },
  article_blog: {
    name: "Article de blog",
    title: "Guide Complet 2024 : Comment [Sujet] en 5 Étapes",
    description: "Découvrez notre guide complet pour maîtriser [sujet]. Conseils d'experts, exemples concrets et astuces pratiques.",
    keywords: ["guide", "tutoriel", "comment faire"]
  }
};

export default function SEOForm({ onSaveComplete, editingPage }: SEOFormProps) {
  const [domain, setDomain] = useState('https://votre-site.com');
  const [subPath, setSubPath] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [content, setContent] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [isSaving, setIsSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (editingPage) {
      const pageKey = editingPage.page_key || '';
      const parts = pageKey.split('/');

      if (parts.length > 1) {
        setSlug(parts[parts.length - 1]);
        setSubPath(parts.slice(0, -1).join('/'));
      } else {
        setSlug(pageKey);
        setSubPath('');
      }

      setTitle(editingPage.title || '');
      setDescription(editingPage.description || '');
      setKeywords(Array.isArray(editingPage.keywords) ? editingPage.keywords.join(', ') : editingPage.keywords || '');
      setContent(editingPage.content || '');
      setOgTitle(editingPage.og_title || '');
      setOgDescription(editingPage.og_description || '');
      setOgImage(editingPage.og_image || '');
      setStatus(editingPage.status || 'draft');

      if (editingPage.canonical_url) {
        try {
          const url = new URL(editingPage.canonical_url);
          setDomain(`${url.protocol}//${url.host}`);
        } catch (e) {
          // Keep default
        }
      }
    }
  }, [editingPage]);

  const getFullUrl = () => {
    const cleanSubPath = subPath.trim().replace(/^\/+|\/+$/g, '');
    const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
    const path = cleanSubPath ? `${cleanSubPath}/${cleanSlug}` : cleanSlug;
    return `${domain}/${path}`;
  };

  const getPageKey = () => {
    const cleanSubPath = subPath.trim().replace(/^\/+|\/+$/g, '');
    const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
    return cleanSubPath ? `${cleanSubPath}/${cleanSlug}` : cleanSlug;
  };

  const loadTemplate = (templateKey: keyof typeof TEMPLATE_PRESETS) => {
    const template = TEMPLATE_PRESETS[templateKey];
    setTitle(template.title);
    setDescription(template.description);
    setKeywords(template.keywords.join(', '));
    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!slug || !title) {
      alert('Le slug et le titre sont obligatoires');
      return;
    }

    setIsSaving(true);
    try {
      const pageKey = getPageKey();
      const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);

      const data = {
        page_key: pageKey,
        title,
        description: description || null,
        keywords: keywordsArray,
        content: content || null,
        og_title: ogTitle || null,
        og_description: ogDescription || null,
        og_image: ogImage || null,
        canonical_url: getFullUrl(),
        language: 'fr',
        status,
        imported_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('seo_metadata')
        .upsert(data, { onConflict: 'page_key' });

      if (error) throw error;

      alert(editingPage ? 'Page mise à jour avec succès !' : 'Page créée avec succès !');
      onSaveComplete();
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.message || error?.toString() || 'Erreur inconnue';
      alert(`Erreur lors de la sauvegarde : ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {editingPage ? 'Modifier la page' : 'Créer une nouvelle page'}
        </h3>
        <p className="text-gray-600">
          {editingPage ? 'Modifiez les métadonnées SEO de votre page' : 'Définissez toutes les métadonnées SEO pour votre nouvelle page'}
        </p>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Comment ça marche ?</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li><strong>Construisez l'URL</strong> de votre page (domaine + chemin + slug)</li>
                  <li><strong>Remplissez les métadonnées</strong> SEO (titre, description, mots-clés)</li>
                  <li><strong>Choisissez le statut</strong> : Draft pour tester, Published pour activer</li>
                  <li><strong>Sauvegardez</strong> : Si le slug existe déjà, la page sera mise à jour</li>
                </ol>
              </div>
            </div>
            <button onClick={() => setShowHelp(false)} className="text-blue-600 hover:text-blue-800 ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-gray-700" />
            <h4 className="font-bold text-gray-900">1. Configurez l'URL de votre page</h4>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom de domaine
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://votre-site.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sous-chemin (optionnel)
                <span className="text-gray-500 font-normal ml-2">Ex: blog, produits, services</span>
              </label>
              <input
                type="text"
                value={subPath}
                onChange={(e) => setSubPath(e.target.value)}
                placeholder="blog/categorie ou laissez vide"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Slug de la page <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">Ex: a-propos, contact, mon-article</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mon-slug-de-page"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                required
              />
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-gray-300">
              <div className="flex items-center space-x-2 mb-2">
                <LinkIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Aperçu de l'URL :</span>
              </div>
              <div className="font-mono text-sm text-gray-900 break-all bg-gray-50 p-3 rounded-lg">
                {getFullUrl() || 'Remplissez les champs ci-dessus'}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <strong>Identifiant unique (page_key) :</strong> {getPageKey() || 'Non défini'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="font-bold text-gray-900">2. Définissez les métadonnées SEO</h4>
            </div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 text-emerald-700 hover:text-emerald-900 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>Templates</span>
            </button>
          </div>

          {showTemplates && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {Object.entries(TEMPLATE_PRESETS).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => loadTemplate(key as keyof typeof TEMPLATE_PRESETS)}
                  className="p-3 bg-white border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:shadow-sm transition-all text-left"
                >
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre SEO <span className="text-red-500">*</span>
                <span className="text-gray-500 font-normal ml-2">(max 60 caractères)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre accrocheur qui apparaîtra dans Google"
                maxLength={60}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600"
                required
              />
              <div className="text-xs text-gray-600 mt-1">{title.length}/60 caractères</div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description SEO
                <span className="text-gray-500 font-normal ml-2">(max 160 caractères)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description qui apparaîtra sous le titre dans les résultats Google"
                maxLength={160}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600"
              />
              <div className="text-xs text-gray-600 mt-1">{description.length}/160 caractères</div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mots-clés
                <span className="text-gray-500 font-normal ml-2">(séparés par des virgules)</span>
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="mot-clé 1, mot-clé 2, mot-clé 3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <h4 className="font-bold text-gray-900">Contenu de la page</h4>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Texte de la page
              <span className="text-gray-500 font-normal ml-2">(HTML accepté)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Saisissez le contenu de votre page ici..."
              rows={10}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono text-sm"
            />
            <div className="text-xs text-gray-600 mt-1">
              Vous pouvez utiliser du HTML pour formater votre contenu
            </div>
          </div>
        </div>

        <details className="bg-gray-50 rounded-2xl border-2 border-gray-200">
          <summary className="p-6 cursor-pointer font-bold text-gray-900 hover:text-gray-700">
            Options avancées (Open Graph, etc.)
          </summary>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre Open Graph (réseaux sociaux)
              </label>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                placeholder="Titre pour Facebook, LinkedIn, Twitter"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description Open Graph
              </label>
              <textarea
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                placeholder="Description pour les réseaux sociaux"
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Image Open Graph (URL)
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://example.com/image-1200x630.jpg"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
              <div className="text-xs text-gray-600 mt-1">Recommandé : 1200x630 pixels</div>
            </div>
          </div>
        </details>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-200">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-bold text-gray-900">3. Choisissez le statut</h4>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setStatus('draft')}
              className={`p-4 rounded-xl border-2 transition-all ${
                status === 'draft'
                  ? 'bg-white border-amber-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Draft</div>
              <div className="text-xs text-gray-600 mt-1">Non publié</div>
            </button>
            <button
              onClick={() => setStatus('published')}
              className={`p-4 rounded-xl border-2 transition-all ${
                status === 'published'
                  ? 'bg-white border-emerald-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Published</div>
              <div className="text-xs text-gray-600 mt-1">En ligne</div>
            </button>
            <button
              onClick={() => setStatus('archived')}
              className={`p-4 rounded-xl border-2 transition-all ${
                status === 'archived'
                  ? 'bg-white border-gray-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Archived</div>
              <div className="text-xs text-gray-600 mt-1">Archivé</div>
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!slug || !title || isSaving}
          className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
        >
          <Save className="w-6 h-6" />
          <span>{isSaving ? 'Sauvegarde...' : (editingPage ? 'Mettre à jour la page' : 'Créer la page')}</span>
        </button>
      </div>
    </div>
  );
}
