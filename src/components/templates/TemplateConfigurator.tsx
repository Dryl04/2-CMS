'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, GripVertical, ChevronUp, ChevronDown, Download, Eye, Code, Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import SectionCatalog from './SectionCatalog';
import { generateId } from '@/lib/utils';
import { sanitizeHTML } from '@/lib/sanitize';
import { SECTION_CATALOG } from '@/types/database';
import type { PageTemplate, TemplateSection, SectionType, SectionContent } from '@/types/database';

interface TemplateConfiguratorProps {
  template?: PageTemplate;
}

// Section style customization
interface SectionStyle {
  spacing: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  paddingY: string;
  paddingX: string;
}

const DEFAULT_STYLE: SectionStyle = {
  spacing: '0',
  backgroundColor: '',
  textColor: '',
  fontFamily: '',
  paddingY: '0',
  paddingX: '0',
};

const SPACING_OPTIONS = [
  { value: '0', label: 'Aucun' },
  { value: '2', label: 'XS (0.5rem)' },
  { value: '4', label: 'S (1rem)' },
  { value: '8', label: 'M (2rem)' },
  { value: '12', label: 'L (3rem)' },
  { value: '16', label: 'XL (4rem)' },
  { value: '20', label: '2XL (5rem)' },
];

const PADDING_OPTIONS = [
  { value: '0', label: 'Aucun' },
  { value: '4', label: 'S (1rem)' },
  { value: '8', label: 'M (2rem)' },
  { value: '12', label: 'L (3rem)' },
  { value: '16', label: 'XL (4rem)' },
];

const FONT_OPTIONS = [
  { value: '', label: 'Par défaut (Inter)' },
  { value: 'font-serif', label: 'Serif' },
  { value: 'font-mono', label: 'Monospace' },
  { value: 'font-sans', label: 'Sans-serif' },
];

// Default HTML snippets for each section type
const SECTION_DEFAULTS: Record<SectionType, string> = {
  hero: '<div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-8 text-center rounded-2xl">\n  <h1 class="text-4xl font-bold mb-4">Titre Principal</h1>\n  <p class="text-xl opacity-90 max-w-2xl mx-auto">Description ou sous-titre accrocheur pour capter l\'attention des visiteurs.</p>\n  <a href="#" class="inline-block mt-8 px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-gray-100">Commencer</a>\n</div>',
  rich_text: '<div class="prose prose-lg max-w-none">\n  <h2>Titre de section</h2>\n  <p>Votre contenu texte ici. Utilisez des balises HTML standard pour la mise en forme.</p>\n</div>',
  image_text: '<div class="flex flex-col md:flex-row gap-8 items-center">\n  <div class="md:w-1/2">\n    <img src="https://placehold.co/600x400" alt="Description" class="rounded-xl w-full" />\n  </div>\n  <div class="md:w-1/2">\n    <h2 class="text-2xl font-bold mb-4">Titre</h2>\n    <p class="text-gray-600">Description accompagnant l\'image.</p>\n  </div>\n</div>',
  cta: '<div class="bg-gray-900 text-white py-16 px-8 text-center rounded-2xl">\n  <h2 class="text-3xl font-bold mb-4">Prêt à commencer ?</h2>\n  <p class="text-gray-300 mb-8 max-w-xl mx-auto">Rejoignez-nous dès maintenant et profitez de tous les avantages.</p>\n  <a href="#" class="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">Démarrer</a>\n</div>',
  faq: '<div class="space-y-4">\n  <h2 class="text-2xl font-bold mb-6">Questions fréquentes</h2>\n  <details class="border border-gray-200 rounded-xl p-4">\n    <summary class="font-semibold cursor-pointer">Question 1 ?</summary>\n    <p class="mt-2 text-gray-600">Réponse à la question 1.</p>\n  </details>\n  <details class="border border-gray-200 rounded-xl p-4">\n    <summary class="font-semibold cursor-pointer">Question 2 ?</summary>\n    <p class="mt-2 text-gray-600">Réponse à la question 2.</p>\n  </details>\n</div>',
  testimonials: '<div class="grid md:grid-cols-2 gap-6">\n  <div class="bg-gray-50 p-6 rounded-xl">\n    <p class="text-gray-600 italic">"Excellent service, je recommande vivement !"</p>\n    <p class="mt-4 font-semibold">— Client 1</p>\n  </div>\n  <div class="bg-gray-50 p-6 rounded-xl">\n    <p class="text-gray-600 italic">"Une expérience remarquable du début à la fin."</p>\n    <p class="mt-4 font-semibold">— Client 2</p>\n  </div>\n</div>',
  gallery: '<div class="grid grid-cols-2 md:grid-cols-3 gap-4">\n  <img src="https://placehold.co/400x300" alt="Image 1" class="rounded-xl w-full" />\n  <img src="https://placehold.co/400x300" alt="Image 2" class="rounded-xl w-full" />\n  <img src="https://placehold.co/400x300" alt="Image 3" class="rounded-xl w-full" />\n</div>',
  features: '<div class="grid md:grid-cols-3 gap-8">\n  <div class="text-center">\n    <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>\n    <h3 class="font-bold mb-2">Fonctionnalité 1</h3>\n    <p class="text-gray-600 text-sm">Description de cette fonctionnalité.</p>\n  </div>\n  <div class="text-center">\n    <div class="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>\n    <h3 class="font-bold mb-2">Fonctionnalité 2</h3>\n    <p class="text-gray-600 text-sm">Description de cette fonctionnalité.</p>\n  </div>\n  <div class="text-center">\n    <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>\n    <h3 class="font-bold mb-2">Fonctionnalité 3</h3>\n    <p class="text-gray-600 text-sm">Description de cette fonctionnalité.</p>\n  </div>\n</div>',
  stats: '<div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">\n  <div>\n    <p class="text-3xl font-bold text-blue-600">99%</p>\n    <p class="text-gray-500 text-sm mt-1">Satisfaction</p>\n  </div>\n  <div>\n    <p class="text-3xl font-bold text-green-600">10K+</p>\n    <p class="text-gray-500 text-sm mt-1">Utilisateurs</p>\n  </div>\n  <div>\n    <p class="text-3xl font-bold text-purple-600">50+</p>\n    <p class="text-gray-500 text-sm mt-1">Pays</p>\n  </div>\n  <div>\n    <p class="text-3xl font-bold text-amber-600">24/7</p>\n    <p class="text-gray-500 text-sm mt-1">Support</p>\n  </div>\n</div>',
  contact: '<div class="max-w-lg mx-auto">\n  <h2 class="text-2xl font-bold mb-6 text-center">Contactez-nous</h2>\n  <form class="space-y-4">\n    <input type="text" placeholder="Nom" class="w-full px-4 py-3 border border-gray-300 rounded-xl" />\n    <input type="email" placeholder="Email" class="w-full px-4 py-3 border border-gray-300 rounded-xl" />\n    <textarea placeholder="Message" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"></textarea>\n    <button type="submit" class="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800">Envoyer</button>\n  </form>\n</div>',
};

export default function TemplateConfigurator({ template }: TemplateConfiguratorProps) {
  const router = useRouter();
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [sections, setSections] = useState<TemplateSection[]>(template?.sections || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sectionPreviews, setSectionPreviews] = useState<Record<string, string>>({});
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [sectionStyles, setSectionStyles] = useState<Record<string, SectionStyle>>({});
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const fullPreviewIframeRef = useRef<HTMLIFrameElement>(null);
  const [fullPreviewHeight, setFullPreviewHeight] = useState(400);

  const getSectionStyle = (id: string): SectionStyle => {
    return sectionStyles[id] || DEFAULT_STYLE;
  };

  const updateSectionStyle = (id: string, updates: Partial<SectionStyle>) => {
    setSectionStyles((prev) => ({
      ...prev,
      [id]: { ...getSectionStyle(id), ...updates },
    }));
  };

  const addSection = (type: SectionType) => {
    const id = generateId();
    const newSection: TemplateSection = {
      id,
      type,
      label: SECTION_CATALOG[type].label,
      required: true,
      min_words: 0,
      max_words: 5000,
      order: sections.length,
    };
    setSections([...sections, newSection]);
    // Set default HTML for preview
    setSectionPreviews((prev) => ({ ...prev, [id]: SECTION_DEFAULTS[type] }));
    setSectionStyles((prev) => ({ ...prev, [id]: { ...DEFAULT_STYLE } }));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
    setSectionPreviews((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setSectionStyles((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const updateSection = (id: string, updates: Partial<TemplateSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const updateSectionPreview = (id: string, html: string) => {
    setSectionPreviews((prev) => ({ ...prev, [id]: html }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Le nom du modèle est obligatoire');
      return;
    }
    if (sections.length === 0) {
      toast.error('Ajoutez au moins une section');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    const data = {
      name: name.trim(),
      description: description.trim() || null,
      sections,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (template) {
      ({ error } = await supabase.from('page_templates').update(data).eq('id', template.id));
    } else {
      ({ error } = await supabase.from('page_templates').insert(data));
    }

    setIsSaving(false);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success(template ? 'Modèle mis à jour' : 'Modèle créé');
      router.push('/admin/templates');
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      template_name: name,
      sections: sections.map((s) => ({
        section_id: s.id,
        type: s.type,
        label: s.label,
        required: s.required,
        min_words: s.min_words,
        max_words: s.max_words,
        content: sectionPreviews[s.id] || SECTION_DEFAULTS[s.type] || '',
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${name || 'modele'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Modèle JSON téléchargé');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Config */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Informations du modèle</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Page produit, Article blog..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description optionnelle du modèle"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Sections list */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Sections ({sections.length})
            </h2>
            {sections.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showPreview ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Masquer l\'aperçu' : 'Aperçu'}
              </button>
            )}
          </div>
          {sections.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Ajoutez des sections depuis le catalogue →</p>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={section.label}
                        onChange={(e) => updateSection(section.id, { label: e.target.value })}
                        className="font-medium text-gray-900 bg-transparent border-none p-0 focus:outline-none w-full"
                      />
                      <span className="text-xs text-gray-400">{section.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingCode(editingCode === section.id ? null : section.id)}
                        className={`p-1 rounded transition-colors ${editingCode === section.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`}
                        title="Modifier le code HTML"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingStyle(editingStyle === section.id ? null : section.id)}
                        className={`p-1 rounded transition-colors ${editingStyle === section.id ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100 text-gray-500'}`}
                        title="Personnaliser le style"
                      >
                        <Palette className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-20">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-20">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => removeSection(section.id)} className="p-1 hover:bg-red-50 rounded text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Code editor for section */}
                  {editingCode === section.id && (
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 mb-1 block">Code HTML par défaut (Tailwind CSS supporté)</label>
                      <textarea
                        value={sectionPreviews[section.id] || SECTION_DEFAULTS[section.type] || ''}
                        onChange={(e) => updateSectionPreview(section.id, e.target.value)}
                        className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-gray-900 resize-y bg-gray-900 text-green-400"
                        spellCheck={false}
                      />
                    </div>
                  )}

                  {/* Style customization panel */}
                  {editingStyle === section.id && (
                    <div className="mb-3 bg-gray-50 rounded-lg p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Espacement (marge haute)</label>
                          <select
                            value={getSectionStyle(section.id).spacing}
                            onChange={(e) => updateSectionStyle(section.id, { spacing: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            {SPACING_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Police</label>
                          <select
                            value={getSectionStyle(section.id).fontFamily}
                            onChange={(e) => updateSectionStyle(section.id, { fontFamily: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            {FONT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Couleur de fond</label>
                          <input
                            type="color"
                            value={getSectionStyle(section.id).backgroundColor || '#ffffff'}
                            onChange={(e) => updateSectionStyle(section.id, { backgroundColor: e.target.value === '#ffffff' ? '' : e.target.value })}
                            className="w-full h-8 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Couleur du texte</label>
                          <input
                            type="color"
                            value={getSectionStyle(section.id).textColor || '#000000'}
                            onChange={(e) => updateSectionStyle(section.id, { textColor: e.target.value === '#000000' ? '' : e.target.value })}
                            className="w-full h-8 rounded-lg cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Padding vertical</label>
                          <select
                            value={getSectionStyle(section.id).paddingY}
                            onChange={(e) => updateSectionStyle(section.id, { paddingY: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            {PADDING_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Padding horizontal</label>
                          <select
                            value={getSectionStyle(section.id).paddingX}
                            onChange={(e) => updateSectionStyle(section.id, { paddingX: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            {PADDING_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section preview in iframe */}
                  {showPreview && (
                    <div className="mt-3 border border-gray-100 rounded-lg overflow-hidden bg-white">
                      <TemplatePreviewIframe
                        html={sectionPreviews[section.id] || SECTION_DEFAULTS[section.type] || `<p class="text-gray-400 text-center">Aperçu: ${section.label}</p>`}
                        style={getSectionStyle(section.id)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={section.required}
                        onChange={(e) => updateSection(section.id, { required: e.target.checked })}
                        className="rounded"
                      />
                      Obligatoire
                    </label>
                    <div>
                      <label className="text-xs text-gray-500">Mots min</label>
                      <input
                        type="number"
                        value={section.min_words}
                        onChange={(e) => updateSection(section.id, { min_words: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Mots max</label>
                      <input
                        type="number"
                        value={section.max_words}
                        onChange={(e) => updateSection(section.id, { max_words: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full page preview with iframe */}
        {showPreview && sections.length > 0 && (
          <FullTemplatePreview
            sections={sections}
            sectionPreviews={sectionPreviews}
            sectionStyles={sectionStyles}
            name={name}
            getSectionStyle={getSectionStyle}
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Sauvegarde...' : template ? 'Mettre à jour' : 'Créer le modèle'}
          </button>
          {sections.length > 0 && (
            <button
              onClick={handleExportJSON}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export JSON
            </button>
          )}
        </div>
      </div>

      {/* Right: Catalog */}
      <div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Catalogue de sections</h2>
          <p className="text-sm text-gray-500 mb-4">Cliquez pour ajouter une section au modèle</p>
          <SectionCatalog onAdd={addSection} />
        </div>
      </div>
    </div>
  );
}

// Iframe-based preview for a single section
function TemplatePreviewIframe({ html, style }: { html: string; style: SectionStyle }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'tpl-section-height' && typeof event.data.height === 'number') {
        setHeight(Math.max(100, event.data.height + 10));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sanitized = sanitizeHTML(html);
  const inlineStyles = [
    style.backgroundColor ? `background-color: ${style.backgroundColor};` : '',
    style.textColor ? `color: ${style.textColor};` : '',
  ].filter(Boolean).join(' ');
  const spacingClass = style.spacing !== '0' ? `mt-${style.spacing}` : '';
  const paddingYClass = style.paddingY !== '0' ? `py-${style.paddingY}` : '';
  const paddingXClass = style.paddingX !== '0' ? `px-${style.paddingX}` : '';
  const fontClass = style.fontFamily || '';

  const srcdoc = `<!DOCTYPE html>
<html><head>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body{font-family:'Inter',sans-serif;margin:0;padding:0;}</style>
</head><body>
  <div class="${spacingClass} ${paddingYClass} ${paddingXClass} ${fontClass}" style="${inlineStyles}">
    ${sanitized}
  </div>
  <script>
    function h(){window.parent.postMessage({type:'tpl-section-height',height:document.documentElement.scrollHeight},'*')}
    window.addEventListener('load',h);setTimeout(h,500);setTimeout(h,1500);
  <\/script>
</body></html>`;

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0"
      style={{ height: `${height}px` }}
      sandbox="allow-scripts"
      srcDoc={srcdoc}
      title="Aperçu de la section"
    />
  );
}

// Full template preview with all sections
function FullTemplatePreview({
  sections,
  sectionPreviews,
  sectionStyles,
  name,
  getSectionStyle,
}: {
  sections: TemplateSection[];
  sectionPreviews: Record<string, string>;
  sectionStyles: Record<string, SectionStyle>;
  name: string;
  getSectionStyle: (id: string) => SectionStyle;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'tpl-full-height' && typeof event.data.height === 'number') {
        setHeight(Math.max(200, event.data.height + 20));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  let body = '';
  sections.forEach((section) => {
    const html = sanitizeHTML(sectionPreviews[section.id] || SECTION_DEFAULTS[section.type] || '');
    const style = getSectionStyle(section.id);
    const inlineStyles = [
      style.backgroundColor ? `background-color: ${style.backgroundColor};` : '',
      style.textColor ? `color: ${style.textColor};` : '',
    ].filter(Boolean).join(' ');
    const spacingClass = style.spacing !== '0' ? `mt-${style.spacing}` : '';
    const paddingYClass = style.paddingY !== '0' ? `py-${style.paddingY}` : '';
    const paddingXClass = style.paddingX !== '0' ? `px-${style.paddingX}` : '';
    const fontClass = style.fontFamily || '';
    body += `<section class="${spacingClass} ${paddingYClass} ${paddingXClass} ${fontClass}" style="${inlineStyles}">${html}</section>`;
  });

  const srcdoc = `<!DOCTYPE html>
<html><head>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body{font-family:'Inter',sans-serif;margin:0;padding:0;}</style>
</head><body>
  ${body}
  <script>
    function h(){window.parent.postMessage({type:'tpl-full-height',height:document.documentElement.scrollHeight},'*')}
    window.addEventListener('load',h);setTimeout(h,500);setTimeout(h,1500);
  <\/script>
</body></html>`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 px-3 py-1 bg-white rounded-lg text-xs text-gray-500 font-mono">
          Aperçu complet du modèle: {name || 'Sans titre'}
        </div>
      </div>
      <iframe
        ref={iframeRef}
        className="w-full border-0"
        style={{ height: `${height}px` }}
        sandbox="allow-scripts"
        srcDoc={srcdoc}
        title="Aperçu complet du modèle"
      />
    </div>
  );
}
