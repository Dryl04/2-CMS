'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import type { SEOMetadata } from '@/types/database';

interface SEOFieldsProps {
  data: Partial<SEOMetadata>;
  onChange: (field: string, value: string | string[] | null) => void;
  onAutoSlug?: (slug: string) => void;
}

interface PageOption {
  page_key: string;
  title: string;
  slug: string;
}

export default function SEOFields({ data, onChange, onAutoSlug }: SEOFieldsProps) {
  const [keywordInput, setKeywordInput] = useState('');
  const [availablePages, setAvailablePages] = useState<PageOption[]>([]);
  const [showNewParentDialog, setShowNewParentDialog] = useState(false);
  const [newParentTitle, setNewParentTitle] = useState('');

  const titleLength = data.title?.length || 0;
  const descLength = data.meta_description?.length || 0;

  // Load available pages for parent selector
  useEffect(() => {
    loadAvailablePages();
  }, []);

  const loadAvailablePages = async () => {
    const supabase = createClient();
    const { data: pages } = await supabase
      .from('seo_metadata')
      .select('page_key, title, slug')
      .order('title');
    if (pages) setAvailablePages(pages);
  };

  // Construct full URL path from slug (which can now contain slashes)
  const fullPath = useMemo(() => {
    if (!data.slug) return '';
    // Ensure slug starts with /
    return data.slug.startsWith('/') ? data.slug : '/' + data.slug;
  }, [data.slug]);

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    const newKeywords = [...(data.keywords || []), keywordInput.trim()];
    onChange('keywords', newKeywords);
    setKeywordInput('');
  };

  const removeKeyword = (index: number) => {
    const newKeywords = (data.keywords || []).filter((_, i) => i !== index);
    onChange('keywords', newKeywords);
  };

  const handleNewParent = () => {
    if (!newParentTitle.trim()) return;
    // This will be handled by parent component
    onChange('parent_page_key', `__NEW__:${newParentTitle}`);
    setShowNewParentDialog(false);
    setNewParentTitle('');
  };

  return (
    <div className="space-y-5">
      {/* Title - now at the top */}
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
          <span>Titre SEO *</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${titleLength > 60 ? 'bg-red-500' : titleLength > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
              />
            </div>
            <span className={`text-xs tabular-nums ${titleLength > 60 ? 'text-red-500' : titleLength > 50 ? 'text-amber-500' : 'text-gray-400'}`}>
              {titleLength}/60
            </span>
          </div>
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Titre optimise pour le SEO"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
        />
        {titleLength > 60 && (
          <p className="text-xs text-red-500 mt-1">Le titre depasse la limite recommandee de 60 caracteres pour le SEO</p>
        )}
        <p className="text-xs text-gray-400 mt-1">💡 Le slug de la page sera généré automatiquement à partir de ce titre</p>
      </div>

      {/* Page key */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cle de page *</label>
        <input
          type="text"
          value={data.page_key || ''}
          onChange={(e) => onChange('page_key', e.target.value)}
          placeholder="identifiant-unique-page"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-sm"
        />
      </div>

      {/* URL personnalisée */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL de la page *</label>
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-1">/</span>
          <input
            type="text"
            value={data.slug || ''}
            onChange={(e) => {
              // Remove leading slash if user types it, and replace spaces with hyphens
              const value = e.target.value.replace(/^\/+/, '').replace(/\s+/g, '-');
              onChange('slug', value);
            }}
            placeholder="categorie/sous-categorie/mon-article"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-sm"
          />
        </div>
        {fullPath && (
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-gray-400">Apercu URL:</span>
            <span className="font-mono ml-1">{fullPath}</span>
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          💡 Modifiable manuellement, mais sera rempli automatiquement depuis le titre
        </p>
      </div>

      {/* Parent page selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Page parente (catégorie)</label>
        <div className="flex gap-2">
          <select
            value={data.parent_page_key || ''}
            onChange={(e) => onChange('parent_page_key', e.target.value || null)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 text-sm"
          >
            <option value="">Aucune (page racine)</option>
            {availablePages.map((page) => (
              <option key={page.page_key} value={page.page_key}>
                {page.title} ({page.slug})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewParentDialog(true)}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium flex items-center gap-2"
            title="Créer une nouvelle page parente"
          >
            <Plus className="w-4 h-4" />
            Créer
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Définissez une page parente pour créer une structure hiérarchique (ex: Blog → Article)
        </p>
      </div>

      {/* New parent dialog */}
      {showNewParentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewParentDialog(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Créer une nouvelle page parente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la page parente</label>
                <input
                  type="text"
                  value={newParentTitle}
                  onChange={(e) => setNewParentTitle(e.target.value)}
                  placeholder="Ex: Blog, Produits, Services..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewParentDialog(false);
                    setNewParentTitle('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleNewParent}
                  disabled={!newParentTitle.trim()}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-xl font-medium"
                >
                  Créer et utiliser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meta description */}
      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
          <span>Meta Description *</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${descLength > 155 ? 'bg-red-500' : descLength > 140 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (descLength / 155) * 100)}%` }}
              />
            </div>
            <span className={`text-xs tabular-nums ${descLength > 155 ? 'text-red-500' : descLength > 140 ? 'text-amber-500' : 'text-gray-400'}`}>
              {descLength}/155
            </span>
          </div>
        </label>
        <textarea
          value={data.meta_description || ''}
          onChange={(e) => onChange('meta_description', e.target.value)}
          placeholder="Description pour les moteurs de recherche..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 resize-none"
        />
        {descLength > 155 && (
          <p className="text-xs text-red-500 mt-1">La description depasse la limite recommandee de 155 caracteres pour le SEO</p>
        )}
      </div>

      {/* Canonical URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL Canonique</label>
        <input
          type="url"
          value={data.canonical_url || ''}
          onChange={(e) => onChange('canonical_url', e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-sm"
        />
      </div>

      {/* Schema.org Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de contenu (Schema.org)
        </label>
        <select
          value={data.schema_type || 'WebPage'}
          onChange={(e) => onChange('schema_type', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
        >
          <option value="WebPage">Page Web (défaut)</option>
          <option value="Article">Article</option>
          <option value="BlogPosting">Article de blog</option>
          <option value="Product">Produit</option>
          <option value="Service">Service</option>
          <option value="FAQPage">Page FAQ</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Type de structured data pour améliorer l&apos;affichage dans les résultats de recherche
        </p>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mots-cles</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
            placeholder="Ajouter un mot-cle"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-900"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium"
          >
            Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.keywords || []).map((kw, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-sm rounded-lg"
            >
              {kw}
              <button type="button" onClick={() => removeKeyword(i)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </span>
          ))}
        </div>
      </div>

      {/* SERP Preview */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Search className="w-4 h-4" />
          Apercu SERP Google
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-lg text-blue-700 hover:underline cursor-pointer truncate">
            {data.title || 'Titre de la page'}
          </div>
          <div className="text-sm text-green-700 truncate mt-0.5">
            example.com{fullPath || '/' + (data.slug || 'slug-de-la-page')}
          </div>
          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
            {data.meta_description || 'Description de la page pour les moteurs de recherche...'}
          </div>
        </div>
      </div>
    </div>
  );
}
