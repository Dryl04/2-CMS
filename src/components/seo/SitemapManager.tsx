'use client';

import { useState, useEffect, useCallback } from 'react';
import { Globe, Eye, EyeOff, RefreshCw, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';

interface SitemapEntry {
  id: string;
  slug: string;
  title: string;
  status: string;
  exclude_from_sitemap: boolean;
}

const PAGE_SIZE = 30;

export default function SitemapManager() {
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [siteUrl, setSiteUrl] = useState('');

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const from = (currentPage - 1) * PAGE_SIZE;

    const { data, count, error } = await supabase
      .from('seo_metadata')
      .select('id, slug, title, status, exclude_from_sitemap', { count: 'exact' })
      .eq('status', 'published')
      .order('slug')
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      setEntries(data || []);
      setTotal(count || 0);
    }
    setIsLoading(false);
  }, [currentPage]);

  useEffect(() => {
    loadEntries();
    // Try to get site URL from env or config
    setSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
  }, [loadEntries]);

  const toggleExclude = async (entry: SitemapEntry) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('seo_metadata')
      .update({ exclude_from_sitemap: !entry.exclude_from_sitemap })
      .eq('id', entry.id);

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      setEntries(entries.map((e) =>
        e.id === entry.id ? { ...e, exclude_from_sitemap: !e.exclude_from_sitemap } : e
      ));
      toast.success(entry.exclude_from_sitemap ? 'Inclus dans le sitemap' : 'Exclu du sitemap');
    }
  };

  const includedCount = entries.filter((e) => !e.exclude_from_sitemap).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestion du Sitemap</h2>
          <p className="text-sm text-gray-500">
            {total} pages publiées — {includedCount} dans le sitemap
          </p>
        </div>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
        >
          <ExternalLink className="w-4 h-4" />
          Voir sitemap.xml
        </a>
      </div>

      {/* URL config */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">URL du site</label>
        <input
          type="url"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Utilisé pour construire les URLs dans le sitemap.xml. Configurez NEXT_PUBLIC_SITE_URL pour une valeur permanente.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune page publiée</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Page</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">URL</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">Sitemap</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className={`border-b border-gray-100 ${entry.exclude_from_sitemap ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4 font-medium text-gray-900 truncate max-w-[200px]">
                    {entry.title}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">
                    /{entry.slug}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleExclude(entry)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${entry.exclude_from_sitemap ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}
                    >
                      {entry.exclude_from_sitemap ? (
                        <><EyeOff className="w-3.5 h-3.5" /> Exclu</>
                      ) : (
                        <><Eye className="w-3.5 h-3.5" /> Inclus</>
                      )}
                    </button>
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
    </div>
  );
}
