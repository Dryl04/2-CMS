'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Trash2, Edit, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { SEOMetadata, PageStatus } from '@/types/database';

const PAGE_SIZE = 20;

export default function PagesListPage() {
  const [pages, setPages] = useState<SEOMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const from = (currentPage - 1) * PAGE_SIZE;

    let query = supabase
      .from('seo_metadata')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%,page_key.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      setPages(data || []);
      setTotal(count || 0);
    }
    setIsLoading(false);
  }, [currentPage, statusFilter, search]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase.from('seo_metadata').delete().eq('id', deleteId);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Page supprimée');
      loadPages();
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages SEO</h1>
          <p className="text-gray-500 mt-1">{total} page(s) au total</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle page
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, slug ou clé..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PageStatus | '')}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
        >
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="pending">En attente</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {search || statusFilter ? 'Aucun résultat pour cette recherche' : 'Aucune page créée'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Page</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Slug</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Mots-clés</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 truncate max-w-[250px]">{page.title}</div>
                    <div className="text-xs text-gray-400 font-mono">{page.page_key}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs text-gray-600">/{page.slug}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={page.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {(page.keywords || []).slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded-md">{kw}</span>
                      ))}
                      {(page.keywords || []).length > 3 && (
                        <span className="text-xs text-gray-400">+{page.keywords!.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {page.status === 'published' && (
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          title="Voir"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => setDeleteId(page.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > PAGE_SIZE && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(total / PAGE_SIZE)}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer la page"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette page SEO ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
