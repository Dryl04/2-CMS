'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, FileText, Trash2, Edit, Copy, Download, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TemplateCardPreview from '@/components/templates/TemplateCardPreview';
import type { PageTemplate } from '@/types/database';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTemplates = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('page_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur de chargement: ' + error.message);
    } else {
      setTemplates(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase.from('page_templates').delete().eq('id', deleteId);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Modele supprime');
      setTemplates(templates.filter((t) => t.id !== deleteId));
    }
    setDeleteId(null);
  };

  const handleDuplicate = async (template: PageTemplate) => {
    const supabase = createClient();
    const { error } = await supabase.from('page_templates').insert({
      name: `${template.name} (copie)`,
      description: template.description,
      sections: template.sections,
    });
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Modele duplique');
      loadTemplates();
    }
  };

  const handleExportTemplate = (template: PageTemplate) => {
    const exportData = {
      name: template.name,
      description: template.description,
      sections: template.sections,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${template.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Modele exporte');
  };

  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const supabase = createClient();

        const { error } = await supabase.from('page_templates').insert({
          name: data.name || 'Modele importe',
          description: data.description || null,
          sections: data.sections || [],
        });

        if (error) {
          toast.error('Erreur: ' + error.message);
        } else {
          toast.success('Modele importe avec succes');
          loadTemplates();
        }
      } catch {
        toast.error('Fichier JSON invalide');
      }
    };
    reader.readAsText(file);

    // Reset input to allow re-importing same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modeles de pages</h1>
          <p className="text-gray-500 mt-1">Creez des structures reutilisables pour vos pages SEO</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportTemplate}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Importer
          </button>
          <Link
            href="/admin/templates/new"
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau modele
          </Link>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun modele</h3>
          <p className="text-gray-500 mb-6">Creez votre premier modele pour structurer vos pages SEO</p>
          <Link
            href="/admin/templates/new"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            Creer un modele
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
              <TemplateCardPreview template={template} />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.sections.map((section) => (
                    <span
                      key={section.id}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg"
                    >
                      {section.label}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  {template.sections.length} section{template.sections.length > 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/templates/${template.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleExportTemplate(template)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg"
                    title="Exporter"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(template.id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer le modele"
        message="Cette action est irreversible. Voulez-vous vraiment supprimer ce modele ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
