'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, EyeOff, Settings, FileText, Loader2, ArrowLeft, Code, Globe, Lock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils';
import SEOFields from './SEOFields';
import SectionEditor from './SectionEditor';
import PagePreview from './PagePreview';
import RichTextEditor from '@/components/ui/RichTextEditor';
import type { SEOMetadata, PageTemplate, SectionContent, PageStatus } from '@/types/database';

interface PageEditorProps {
  pageId?: string;
}

type EditorTab = 'seo' | 'content' | 'preview';
type ContentMode = 'visual' | 'code';

export default function PageEditor({ pageId }: PageEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EditorTab>('seo');
  const [contentMode, setContentMode] = useState<ContentMode>('visual');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!pageId);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate | null>(null);

  // Page data
  const [pageData, setPageData] = useState<Partial<SEOMetadata>>({
    page_key: '',
    slug: '',
    title: '',
    meta_description: '',
    h1: '',
    h2: '',
    canonical_url: '',
    keywords: [],
    content: '',
    status: 'draft',
    is_public: true,
    exclude_from_sitemap: false,
  });

  // Template section contents
  const [sectionContents, setSectionContents] = useState<SectionContent[]>([]);

  useEffect(() => {
    loadTemplates();
    if (pageId) loadPage();
  }, [pageId]);

  const loadTemplates = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('page_templates')
      .select('*')
      .order('name');
    setTemplates(data || []);
  };

  const loadPage = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('id', pageId)
      .single();

    if (error) {
      toast.error('Page introuvable');
      router.push('/admin/pages');
      return;
    }

    setPageData({
      ...data,
      is_public: data.is_public ?? true,
    });
    if (data.sections_content) {
      setSectionContents(data.sections_content as SectionContent[]);
    }

    // Load associated template
    if (data.template_id) {
      const { data: tpl } = await supabase
        .from('page_templates')
        .select('*')
        .eq('id', data.template_id)
        .single();
      if (tpl) setSelectedTemplate(tpl);
    }

    setIsLoading(false);
  };

  const updateField = (field: string, value: string | string[] | boolean | null) => {
    setPageData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from page_key if slug is empty
      if (field === 'page_key' && !prev.slug && typeof value === 'string') {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleTemplateChange = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId) || null;
    setSelectedTemplate(tpl);
    updateField('template_id', templateId || null);

    // Initialize section contents for new template
    if (tpl) {
      const existingIds = sectionContents.map((sc) => sc.section_id);
      const newContents = tpl.sections
        .filter((s) => !existingIds.includes(s.id))
        .map((s) => ({ section_id: s.id, content: '' }));
      setSectionContents([...sectionContents, ...newContents]);
    }
  };

  const updateSectionContent = (content: SectionContent) => {
    setSectionContents((prev) => {
      const existing = prev.findIndex((sc) => sc.section_id === content.section_id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = content;
        return updated;
      }
      return [...prev, content];
    });
  };

  const handleSave = async (newStatus?: PageStatus) => {
    if (!pageData.page_key?.trim()) {
      toast.error('La clé de page est obligatoire');
      return;
    }
    if (!pageData.slug?.trim()) {
      toast.error('Le slug est obligatoire');
      return;
    }
    if (!pageData.title?.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }
    if (!pageData.meta_description?.trim()) {
      toast.error('La meta description est obligatoire');
      return;
    }

    // Validate template sections
    if (selectedTemplate) {
      const requiredMissing = selectedTemplate.sections
        .filter((s) => s.required)
        .filter((s) => {
          const content = sectionContents.find((sc) => sc.section_id === s.id);
          return !content?.content?.trim();
        });

      if (requiredMissing.length > 0 && (newStatus === 'published' || newStatus === 'pending')) {
        toast.error(`Sections obligatoires manquantes: ${requiredMissing.map((s) => s.label).join(', ')}`);
        return;
      }
    }

    setIsSaving(true);
    const supabase = createClient();

    const record = {
      page_key: pageData.page_key!.trim(),
      slug: pageData.slug!.trim().replace(/\s+/g, '-'),
      title: pageData.title!.trim(),
      meta_description: pageData.meta_description!.trim(),
      h1: pageData.h1?.trim() || null,
      h2: pageData.h2?.trim() || null,
      canonical_url: pageData.canonical_url?.trim() || null,
      keywords: pageData.keywords || [],
      content: pageData.content || null,
      status: newStatus || pageData.status || 'draft',
      template_id: selectedTemplate?.id || null,
      sections_content: sectionContents.length > 0 ? sectionContents : null,
      is_public: pageData.is_public === false ? false : true,
      exclude_from_sitemap: Boolean(pageData.exclude_from_sitemap),
      updated_at: new Date().toISOString(),
    };

    console.log('📝 Sauvegarde de la page:', {
      slug: record.slug,
      status: record.status,
      is_public: record.is_public,
      pageId
    });

    let error;
    if (pageId) {
      ({ error } = await supabase.from('seo_metadata').update(record).eq('id', pageId));
    } else {
      ({ error } = await supabase.from('seo_metadata').insert(record));
    }

    setIsSaving(false);
    if (error) {
      console.error('❌ Erreur de sauvegarde:', error);
      toast.error('Erreur: ' + error.message);
    } else {
      console.log('✅ Page sauvegardée avec succès');
      toast.success(pageId ? 'Page mise à jour' : 'Page créée');
      if (!pageId) router.push('/admin/pages');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const tabs = [
    { id: 'seo' as const, label: 'SEO & Méta', icon: Settings },
    { id: 'content' as const, label: 'Contenu', icon: FileText },
    { id: 'preview' as const, label: 'Aperçu', icon: Eye },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {pageId ? 'Modifier la page' : 'Nouvelle page'}
            </h1>
            {pageData.slug && (
              <p className="text-sm text-gray-500 font-mono">/{pageData.slug}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          {pageData.status === 'draft' && (
            <button
              onClick={() => handleSave('pending')}
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-xl font-medium"
            >
              Soumettre
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'seo' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <SEOFields data={pageData} onChange={updateField} />
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* Template selector */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Modèle de page</label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                >
                  <option value="">Aucun modèle (contenu libre)</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.sections.length} sections)
                    </option>
                  ))}
                </select>
              </div>

              {/* Section editors or free content */}
              {selectedTemplate ? (
                <div className="space-y-4">
                  {selectedTemplate.sections.map((section) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      content={sectionContents.find((sc) => sc.section_id === section.id) || { section_id: section.id, content: '' }}
                      onChange={updateSectionContent}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Contenu de la page</label>
                    <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setContentMode('visual')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${contentMode === 'visual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visuel
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentMode('code')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${contentMode === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Code className="w-3.5 h-3.5" />
                        Code HTML
                      </button>
                    </div>
                  </div>
                  {contentMode === 'visual' ? (
                    <RichTextEditor
                      content={pageData.content || ''}
                      onChange={(html) => updateField('content', html)}
                      placeholder="Rédigez le contenu de votre page..."
                    />
                  ) : (
                    <textarea
                      value={pageData.content || ''}
                      onChange={(e) => updateField('content', e.target.value)}
                      placeholder={'<div class="bg-blue-500 text-white p-8">\n  <h2 class="text-3xl font-bold">Mon titre</h2>\n  <p class="mt-4">Mon contenu avec Tailwind CSS...</p>\n</div>'}
                      className="w-full h-80 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:border-gray-900 resize-y bg-gray-900 text-green-400"
                      spellCheck={false}
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    💡 En mode Code HTML, vous pouvez utiliser des classes Tailwind CSS pour personnaliser le design
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <PagePreview
              page={pageData}
              sections={selectedTemplate?.sections}
              sectionContents={sectionContents}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status & Visibility */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">Publication</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Statut</label>
                <select
                  value={pageData.status || 'draft'}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
                >
                  <option value="draft">Brouillon</option>
                  <option value="pending">En attente</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>

              {/* Visibility toggle */}
              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">Visibilité</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('is_public', true)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pageData.is_public
                        ? 'bg-green-50 text-green-700 border-2 border-green-300'
                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    <Globe className="w-4 h-4" />
                    Publique
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('is_public', false)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!pageData.is_public
                        ? 'bg-amber-50 text-amber-700 border-2 border-amber-300'
                        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    <Lock className="w-4 h-4" />
                    Privée
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={pageData.exclude_from_sitemap || false}
                  onChange={(e) => updateField('exclude_from_sitemap', e.target.checked)}
                  className="rounded"
                />
                Exclure du sitemap
              </label>
            </div>
          </div>

          {/* Template info */}
          {selectedTemplate && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Modèle</h3>
              <p className="text-sm text-gray-600">{selectedTemplate.name}</p>
              <div className="mt-2 space-y-1">
                {selectedTemplate.sections.map((section) => {
                  const content = sectionContents.find((sc) => sc.section_id === section.id);
                  const hasContent = !!content?.content?.trim();
                  return (
                    <div key={section.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${hasContent ? 'bg-green-500' : section.required ? 'bg-red-300' : 'bg-gray-300'}`} />
                      <span className={hasContent ? 'text-gray-700' : 'text-gray-400'}>{section.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-3">Informations</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Titre</span>
                <span className={`font-mono ${(pageData.title?.length || 0) > 60 ? 'text-red-500' : 'text-gray-900'}`}>
                  {pageData.title?.length || 0}/60
                </span>
              </div>
              <div className="flex justify-between">
                <span>Description</span>
                <span className={`font-mono ${(pageData.meta_description?.length || 0) > 155 ? 'text-red-500' : 'text-gray-900'}`}>
                  {pageData.meta_description?.length || 0}/155
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mots-clés</span>
                <span className="font-mono text-gray-900">{pageData.keywords?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
