'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Trash2, Edit, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { PageTemplate, SectionType } from '@/types/database';

const SECTION_DEFAULTS: Record<SectionType, string> = {
  hero: '<div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-4 text-center rounded-xl"><h1 class="text-2xl font-bold mb-2">Titre Principal</h1><p class="text-sm opacity-90">Description accrocheur</p></div>',
  rich_text: '<div class="p-4"><h2 class="text-lg font-bold mb-2">Titre de section</h2><p class="text-gray-600 text-sm">Contenu texte ici.</p></div>',
  image_text: '<div class="flex gap-4 items-center p-4"><div class="w-1/2 bg-gray-200 rounded-lg h-20"></div><div class="w-1/2"><h2 class="text-lg font-bold mb-1">Titre</h2><p class="text-gray-600 text-xs">Description</p></div></div>',
  cta: '<div class="bg-gray-900 text-white py-8 px-4 text-center rounded-xl"><h2 class="text-xl font-bold mb-2">Prêt à commencer ?</h2><span class="inline-block px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg">Démarrer</span></div>',
  faq: '<div class="p-4 space-y-2"><h2 class="text-lg font-bold mb-2">FAQ</h2><div class="border border-gray-200 rounded-lg p-2"><p class="font-semibold text-sm">Question 1 ?</p></div><div class="border border-gray-200 rounded-lg p-2"><p class="font-semibold text-sm">Question 2 ?</p></div></div>',
  testimonials: '<div class="grid grid-cols-2 gap-2 p-4"><div class="bg-gray-50 p-3 rounded-lg"><p class="text-gray-600 italic text-xs">"Excellent !"</p><p class="mt-1 font-semibold text-xs">— Client</p></div><div class="bg-gray-50 p-3 rounded-lg"><p class="text-gray-600 italic text-xs">"Remarquable."</p><p class="mt-1 font-semibold text-xs">— Client</p></div></div>',
  gallery: '<div class="grid grid-cols-3 gap-2 p-4"><div class="bg-gray-200 rounded-lg h-12"></div><div class="bg-gray-200 rounded-lg h-12"></div><div class="bg-gray-200 rounded-lg h-12"></div></div>',
  features: '<div class="grid grid-cols-3 gap-3 p-4"><div class="text-center"><div class="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1"></div><p class="font-bold text-xs">Feature 1</p></div><div class="text-center"><div class="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1"></div><p class="font-bold text-xs">Feature 2</p></div><div class="text-center"><div class="w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-1"></div><p class="font-bold text-xs">Feature 3</p></div></div>',
  stats: '<div class="grid grid-cols-4 gap-2 text-center p-4"><div><p class="text-lg font-bold text-blue-600">99%</p><p class="text-gray-500 text-xs">Stat</p></div><div><p class="text-lg font-bold text-green-600">10K+</p><p class="text-gray-500 text-xs">Stat</p></div><div><p class="text-lg font-bold text-purple-600">50+</p><p class="text-gray-500 text-xs">Stat</p></div><div><p class="text-lg font-bold text-amber-600">24/7</p><p class="text-gray-500 text-xs">Stat</p></div></div>',
  contact: '<div class="p-4 text-center"><h2 class="text-lg font-bold mb-2">Contact</h2><div class="space-y-1"><div class="h-6 bg-gray-100 rounded"></div><div class="h-6 bg-gray-100 rounded"></div></div></div>',
};

function TemplateCardPreview({ template }: { template: PageTemplate }) {
  const srcdoc = `<!DOCTYPE html>
<html><head>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body{font-family:'Inter',sans-serif;margin:0;padding:0;overflow:hidden;}</style>
</head><body>
  ${template.sections.map((s) => SECTION_DEFAULTS[s.type] || '').join('')}
</body></html>`;

  return (
    <div className="h-36 overflow-hidden border-b border-gray-100 bg-gray-50 relative">
      <iframe
        className="w-full border-0 pointer-events-none"
        style={{ height: '300px', transform: 'scale(0.48)', transformOrigin: 'top left', width: '208%' }}
        sandbox="allow-scripts"
        srcDoc={srcdoc}
        title={`Aperçu ${template.name}`}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
    </div>
  );
}

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
        title="Supprimer le modèle"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce modèle ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
