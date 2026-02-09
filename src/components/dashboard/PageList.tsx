'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye, ExternalLink } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import type { SEOMetadata, PageStatus } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface PageListProps {
  pages: SEOMetadata[];
  onRefresh: () => void;
}

export default function PageList({ pages, onRefresh }: PageListProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: PageStatus) => {
    const supabase = createClient();
    const updates: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === 'published') updates.published_at = new Date().toISOString();
    const { error } = await supabase.from('seo_metadata').update(updates).eq('id', id);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Statut mis à jour');
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('seo_metadata').delete().eq('id', id);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Page supprimée');
      onRefresh();
    }
    setDeleteTarget(null);
  };

  if (pages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-4">Aucune page trouvée</p>
        <div className="flex justify-center gap-3">
          <Link href="/admin/pages/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm">
            Créer une page
          </Link>
          <Link href="/admin/import" className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm">
            Import en masse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {pages.map((page) => (
          <div key={page.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-sm bg-gray-100 px-2.5 py-0.5 rounded-lg text-gray-700 truncate max-w-[200px]">
                    {page.page_key}
                  </span>
                  <StatusBadge status={page.status} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{page.title}</h3>
                {page.description && (
                  <p className="text-sm text-gray-600 line-clamp-1">{page.description}</p>
                )}
                {page.keywords && page.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {page.keywords.slice(0, 5).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {kw}
                      </span>
                    ))}
                    {page.keywords.length > 5 && (
                      <span className="text-xs text-gray-400">+{page.keywords.length - 5}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {page.status === 'published' && (
                  <a href={`/${page.page_key}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 rounded-lg" title="Voir la page">
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                )}
                <Link href={`/admin/pages/${page.id}/edit`} className="p-2 hover:bg-blue-50 rounded-lg" title="Modifier">
                  <Edit className="w-4 h-4 text-blue-600" />
                </Link>
                <button onClick={() => setDeleteTarget(page.id)} className="p-2 hover:bg-red-50 rounded-lg" title="Supprimer">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                {(['draft', 'pending', 'published', 'archived'] as PageStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(page.id, s)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                      page.status === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {s === 'draft' ? 'Brouillon' : s === 'pending' ? 'Attente' : s === 'published' ? 'Publier' : 'Archiver'}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(page.updated_at)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Supprimer cette page ?"
          message="Cette action est irréversible. La page et toutes ses données seront définitivement supprimées."
          confirmLabel="Supprimer"
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
