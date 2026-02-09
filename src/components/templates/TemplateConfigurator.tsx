'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Trash2, GripVertical, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import SectionCatalog from './SectionCatalog';
import { generateId } from '@/lib/utils';
import { SECTION_CATALOG } from '@/types/database';
import type { PageTemplate, TemplateSection, SectionType } from '@/types/database';

interface TemplateConfiguratorProps {
  template?: PageTemplate;
}

export default function TemplateConfigurator({ template }: TemplateConfiguratorProps) {
  const router = useRouter();
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [sections, setSections] = useState<TemplateSection[]>(template?.sections || []);
  const [isSaving, setIsSaving] = useState(false);

  const addSection = (type: SectionType) => {
    const newSection: TemplateSection = {
      id: generateId(),
      type,
      label: SECTION_CATALOG[type].label,
      required: true,
      min_words: 0,
      max_words: 5000,
      order: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
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
        content: '',
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Sections ({sections.length})
          </h2>
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
