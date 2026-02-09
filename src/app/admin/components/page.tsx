'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Trash2, Edit, Copy, Code, Eye, X, Save, Puzzle } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { sanitizeHTML } from '@/lib/sanitize';
import { generateId } from '@/lib/utils';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { ComponentBlock } from '@/types/database';

const COMPONENT_CATEGORIES = [
  { value: 'hero', label: 'Hero / En-tête' },
  { value: 'content', label: 'Contenu' },
  { value: 'cta', label: 'Appel à l\'action' },
  { value: 'feature', label: 'Fonctionnalités' },
  { value: 'testimonial', label: 'Témoignages' },
  { value: 'pricing', label: 'Tarification' },
  { value: 'footer', label: 'Pied de page' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'form', label: 'Formulaire' },
  { value: 'other', label: 'Autre' },
];

const DEFAULT_TEMPLATES: { name: string; category: string; html: string }[] = [
  {
    name: 'Hero Gradient',
    category: 'hero',
    html: '<div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-8 text-center">\n  <h1 class="text-5xl font-bold mb-6">Votre titre ici</h1>\n  <p class="text-xl opacity-90 max-w-2xl mx-auto mb-8">Une description captivante pour vos visiteurs.</p>\n  <a href="#" class="inline-block px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-gray-100">Commencer</a>\n</div>',
  },
  {
    name: 'Grille de fonctionnalités',
    category: 'feature',
    html: '<div class="py-16 px-8">\n  <h2 class="text-3xl font-bold text-center mb-12">Nos fonctionnalités</h2>\n  <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">\n    <div class="text-center p-6">\n      <div class="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">⚡</div>\n      <h3 class="font-bold text-lg mb-2">Rapide</h3>\n      <p class="text-gray-600">Performance optimale garantie.</p>\n    </div>\n    <div class="text-center p-6">\n      <div class="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>\n      <h3 class="font-bold text-lg mb-2">Sécurisé</h3>\n      <p class="text-gray-600">Protection de vos données.</p>\n    </div>\n    <div class="text-center p-6">\n      <div class="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🎨</div>\n      <h3 class="font-bold text-lg mb-2">Personnalisable</h3>\n      <p class="text-gray-600">Adaptez selon vos besoins.</p>\n    </div>\n  </div>\n</div>',
  },
  {
    name: 'CTA Simple',
    category: 'cta',
    html: '<div class="bg-gray-900 text-white py-16 px-8 text-center">\n  <h2 class="text-3xl font-bold mb-4">Prêt à démarrer ?</h2>\n  <p class="text-gray-400 mb-8 max-w-xl mx-auto">Rejoignez des milliers d\'utilisateurs satisfaits.</p>\n  <div class="flex gap-4 justify-center">\n    <a href="#" class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">Essai gratuit</a>\n    <a href="#" class="px-8 py-3 border border-gray-600 text-white font-semibold rounded-xl hover:bg-gray-800">En savoir plus</a>\n  </div>\n</div>',
  },
  {
    name: 'Témoignages clients',
    category: 'testimonial',
    html: '<div class="py-16 px-8 bg-gray-50">\n  <h2 class="text-3xl font-bold text-center mb-12">Ce que disent nos clients</h2>\n  <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">\n    <div class="bg-white p-8 rounded-2xl shadow-sm">\n      <p class="text-gray-600 italic mb-4">"Un service exceptionnel qui a transformé notre activité."</p>\n      <div class="flex items-center gap-3">\n        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">JD</div>\n        <div>\n          <p class="font-semibold">Jean Dupont</p>\n          <p class="text-sm text-gray-500">CEO, TechCorp</p>\n        </div>\n      </div>\n    </div>\n    <div class="bg-white p-8 rounded-2xl shadow-sm">\n      <p class="text-gray-600 italic mb-4">"Résultats impressionnants dès le premier mois."</p>\n      <div class="flex items-center gap-3">\n        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">ML</div>\n        <div>\n          <p class="font-semibold">Marie Laurent</p>\n          <p class="text-sm text-gray-500">Directrice Marketing</p>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>',
  },
  {
    name: 'Section tarification',
    category: 'pricing',
    html: '<div class="py-16 px-8">\n  <h2 class="text-3xl font-bold text-center mb-12">Nos tarifs</h2>\n  <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">\n    <div class="border border-gray-200 rounded-2xl p-8 text-center">\n      <h3 class="font-bold text-lg mb-2">Starter</h3>\n      <p class="text-4xl font-bold mb-4">9€<span class="text-lg text-gray-500">/mois</span></p>\n      <ul class="text-gray-600 space-y-2 mb-8 text-sm">\n        <li>✓ 5 pages</li>\n        <li>✓ Support email</li>\n        <li>✓ Analytics basiques</li>\n      </ul>\n      <a href="#" class="block py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Choisir</a>\n    </div>\n    <div class="border-2 border-blue-600 rounded-2xl p-8 text-center relative">\n      <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">Populaire</span>\n      <h3 class="font-bold text-lg mb-2">Pro</h3>\n      <p class="text-4xl font-bold mb-4">29€<span class="text-lg text-gray-500">/mois</span></p>\n      <ul class="text-gray-600 space-y-2 mb-8 text-sm">\n        <li>✓ 50 pages</li>\n        <li>✓ Support prioritaire</li>\n        <li>✓ Analytics avancés</li>\n      </ul>\n      <a href="#" class="block py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Choisir</a>\n    </div>\n    <div class="border border-gray-200 rounded-2xl p-8 text-center">\n      <h3 class="font-bold text-lg mb-2">Enterprise</h3>\n      <p class="text-4xl font-bold mb-4">99€<span class="text-lg text-gray-500">/mois</span></p>\n      <ul class="text-gray-600 space-y-2 mb-8 text-sm">\n        <li>✓ Pages illimitées</li>\n        <li>✓ Support dédié</li>\n        <li>✓ API complète</li>\n      </ul>\n      <a href="#" class="block py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50">Contacter</a>\n    </div>\n  </div>\n</div>',
  },
];

export default function ComponentsPage() {
  const [components, setComponents] = useState<ComponentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Partial<ComponentBlock> | null>(null);
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code');
  const [isSaving, setIsSaving] = useState(false);

  const loadComponents = useCallback(async () => {
    const supabase = createClient();
    let query = supabase
      .from('component_blocks')
      .select('*')
      .order('created_at', { ascending: false });

    if (categoryFilter) {
      query = query.eq('category', categoryFilter);
    }
    if (search.trim()) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      // Table may not exist yet — show empty list with templates
      if (!error.message?.includes('does not exist')) {
        toast.error('Erreur de chargement: ' + error.message);
      }
      setComponents([]);
    } else {
      setComponents(data || []);
    }
    setIsLoading(false);
  }, [categoryFilter, search]);

  useEffect(() => {
    loadComponents();
  }, [loadComponents]);

  const openEditor = (component?: ComponentBlock) => {
    if (component) {
      setEditingComponent({ ...component });
    } else {
      setEditingComponent({
        name: '',
        description: '',
        category: 'content',
        html_content: '',
      });
    }
    setShowEditor(true);
    setPreviewMode('code');
  };

  const handleSaveComponent = async () => {
    if (!editingComponent?.name?.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }
    if (!editingComponent?.html_content?.trim()) {
      toast.error('Le code HTML est obligatoire');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    const record = {
      name: editingComponent.name!.trim(),
      description: editingComponent.description?.trim() || null,
      category: editingComponent.category || 'other',
      html_content: editingComponent.html_content!,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (editingComponent.id) {
      ({ error } = await supabase.from('component_blocks').update(record).eq('id', editingComponent.id));
    } else {
      ({ error } = await supabase.from('component_blocks').insert(record));
    }

    setIsSaving(false);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success(editingComponent.id ? 'Composant mis à jour' : 'Composant créé');
      setShowEditor(false);
      setEditingComponent(null);
      loadComponents();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase.from('component_blocks').delete().eq('id', deleteId);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Composant supprimé');
      setComponents(components.filter((c) => c.id !== deleteId));
    }
    setDeleteId(null);
  };

  const handleCopyCode = (html: string) => {
    navigator.clipboard.writeText(html);
    toast.success('Code copié dans le presse-papier');
  };

  const handleUseTemplate = (tmpl: typeof DEFAULT_TEMPLATES[0]) => {
    setEditingComponent({
      name: tmpl.name,
      description: '',
      category: tmpl.category,
      html_content: tmpl.html,
    });
    setShowEditor(true);
    setPreviewMode('preview');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bibliothèque de composants</h1>
          <p className="text-gray-500 mt-1">Créez et réutilisez des blocs HTML/Tailwind dans vos pages</p>
        </div>
        <button
          onClick={() => openEditor()}
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau composant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un composant..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
        >
          <option value="">Toutes les catégories</option>
          {COMPONENT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Saved Components */}
      {components.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Mes composants</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {components.map((comp) => (
              <div key={comp.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                {/* Preview */}
                <div className="border-b border-gray-100 p-4 h-40 overflow-hidden relative">
                  <div
                    className="transform scale-50 origin-top-left w-[200%]"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(comp.html_content) }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{comp.name}</h3>
                      {comp.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{comp.description}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-md text-gray-500">
                      {COMPONENT_CATEGORIES.find((c) => c.value === comp.category)?.label || comp.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleCopyCode(comp.html_content)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                      title="Copier le code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copier
                    </button>
                    <button
                      onClick={() => openEditor(comp)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleteId(comp.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Starter Templates */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          <Puzzle className="w-5 h-5 inline-block mr-2 text-gray-400" />
          Modèles de départ
        </h2>
        <p className="text-sm text-gray-500 mb-4">Utilisez ces modèles comme base pour créer vos propres composants</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DEFAULT_TEMPLATES.map((tmpl, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
              <div className="border-b border-gray-100 p-4 h-40 overflow-hidden relative">
                <div
                  className="transform scale-50 origin-top-left w-[200%]"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(tmpl.html) }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{tmpl.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-md text-gray-500">
                  {COMPONENT_CATEGORIES.find((c) => c.value === tmpl.category)?.label || tmpl.category}
                </span>
                <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleCopyCode(tmpl.html)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copier
                  </button>
                  <button
                    onClick={() => handleUseTemplate(tmpl)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Utiliser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Component Editor Modal */}
      {showEditor && editingComponent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl mx-4 mb-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingComponent.id ? 'Modifier le composant' : 'Nouveau composant'}
              </h2>
              <button
                onClick={() => { setShowEditor(false); setEditingComponent(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={editingComponent.name || ''}
                    onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })}
                    placeholder="Ex: Hero principal"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={editingComponent.category || 'other'}
                    onChange={(e) => setEditingComponent({ ...editingComponent, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                  >
                    {COMPONENT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={editingComponent.description || ''}
                    onChange={(e) => setEditingComponent({ ...editingComponent, description: e.target.value })}
                    placeholder="Description optionnelle"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Code / Preview toggle */}
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Code HTML (Tailwind CSS)</label>
                <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('code')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${previewMode === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${previewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Aperçu
                  </button>
                </div>
              </div>

              {previewMode === 'code' ? (
                <textarea
                  value={editingComponent.html_content || ''}
                  onChange={(e) => setEditingComponent({ ...editingComponent, html_content: e.target.value })}
                  placeholder='<div class="bg-blue-500 text-white p-8 rounded-xl">&#10;  Votre composant HTML/Tailwind ici...&#10;</div>'
                  className="w-full h-72 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:border-gray-900 resize-y bg-gray-900 text-green-400"
                  spellCheck={false}
                />
              ) : (
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden min-h-[200px]">
                  {editingComponent.html_content ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(editingComponent.html_content) }} />
                  ) : (
                    <p className="text-gray-400 text-center py-12">Aucun contenu à prévisualiser</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => { setShowEditor(false); setEditingComponent(null); }}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveComponent}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer le composant"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce composant ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
