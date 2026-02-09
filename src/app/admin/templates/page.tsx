'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Trash2, Edit, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { PageTemplate } from '@/types/database';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      toast.success('Modèle supprimé');
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
      toast.success('Modèle dupliqué');
      loadTemplates();
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modèles de pages</h1>
          <p className="text-gray-500 mt-1">Créez des structures réutilisables pour vos pages SEO</p>
        </div>
        <Link
          href="/admin/templates/new"
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau modèle
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun modèle</h3>
          <p className="text-gray-500 mb-6">Créez votre premier modèle pour structurer vos pages SEO</p>
          <Link
            href="/admin/templates/new"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-medium"
          >
            <Plus className="w-5 h-5" />
            Créer un modèle
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
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
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer le modèle"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce modèle ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
