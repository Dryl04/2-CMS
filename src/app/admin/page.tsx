'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Upload } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import type { SEOMetadata, PageStatus } from '@/types/database';
import StatusCards from '@/components/dashboard/StatusCards';
import PageList from '@/components/dashboard/PageList';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PAGE_SIZE = 20;

export default function DashboardPage() {
  const [pages, setPages] = useState<SEOMetadata[]>([]);
  const [counts, setCounts] = useState<Record<PageStatus, number>>({ draft: 0, pending: 0, published: 0, archived: 0, error: 0 });
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Load counts
    const { data: allPages } = await supabase.from('seo_metadata').select('status');
    if (allPages) {
      const c: Record<string, number> = { draft: 0, pending: 0, published: 0, archived: 0, error: 0 };
      allPages.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1; });
      setCounts(c as Record<PageStatus, number>);
      setTotal(allPages.length);
    }

    // Load page data with filters
    let query = supabase.from('seo_metadata').select('*', { count: 'exact' });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    if (search) {
      query = query.or(`page_key.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    query = query.order('updated_at', { ascending: false });

    const from = (currentPage - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await query;
    setPages((data as SEOMetadata[]) || []);
    if (statusFilter !== 'all' || search) {
      // Use filtered count for pagination  
    }
    setIsLoading(false);
  }, [statusFilter, search, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  const filteredTotal = statusFilter === 'all' && !search ? total : pages.length;
  const totalPages = Math.ceil((statusFilter !== 'all' || search ? filteredTotal : total) / PAGE_SIZE) || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Gérez vos pages SEO</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/pages/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Créer
          </Link>
          <Link href="/admin/import" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </Link>
        </div>
      </div>

      <StatusCards counts={counts} total={total} activeFilter={statusFilter} onFilterChange={setStatusFilter} />

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher par slug, titre ou description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <PageList pages={pages} onRefresh={loadData} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
