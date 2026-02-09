'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RefreshCw, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { SEOMetadata, PublicationConfig } from '@/types/database';

export default function PublicationManager() {
  const [config, setConfig] = useState<PublicationConfig | null>(null);
  const [pendingPages, setPendingPages] = useState<SEOMetadata[]>([]);
  const [recentPublished, setRecentPublished] = useState<SEOMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [pagesPerDay, setPagesPerDay] = useState(5);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    // Load config
    const { data: configData } = await supabase
      .from('publication_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (configData) {
      setConfig(configData);
      setPagesPerDay(configData.pages_per_day);
    }

    // Load pending pages
    const { data: pendingData } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    setPendingPages(pendingData || []);

    // Load recently published
    const { data: publishedData } = await supabase
      .from('seo_metadata')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(10);

    setRecentPublished(publishedData || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveConfig = async () => {
    const supabase = createClient();

    if (config) {
      const { error } = await supabase
        .from('publication_config')
        .update({
          pages_per_day: pagesPerDay,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      if (error) {
        toast.error('Erreur: ' + error.message);
      } else {
        toast.success('Configuration mise à jour');
        loadData();
      }
    } else {
      const { error } = await supabase
        .from('publication_config')
        .insert({
          pages_per_day: pagesPerDay,
          is_active: false,
        });

      if (error) {
        toast.error('Erreur: ' + error.message);
      } else {
        toast.success('Configuration créée');
        loadData();
      }
    }
  };

  const toggleActive = async () => {
    if (!config) {
      await saveConfig();
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('publication_config')
      .update({
        is_active: !config.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success(config.is_active ? 'Publication suspendue' : 'Publication activée');
      loadData();
    }
  };

  const publishNow = async () => {
    if (pendingPages.length === 0) {
      toast.error('Aucune page en attente');
      return;
    }

    setIsPublishing(true);
    const supabase = createClient();
    const toPublish = pendingPages.slice(0, pagesPerDay);
    let success = 0;

    for (const page of toPublish) {
      const { error } = await supabase
        .from('seo_metadata')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', page.id);

      if (!error) success++;
    }

    // Update last_run_at
    if (config) {
      await supabase
        .from('publication_config')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', config.id);
    }

    setIsPublishing(false);
    toast.success(`${success} page(s) publiée(s)`);
    loadData();
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publication</h1>
        <p className="text-gray-500 mt-1">Gérez la file de publication de vos pages SEO</p>
      </div>

      {/* Config card */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">File d&apos;attente</div>
          <div className="text-3xl font-bold text-gray-900">{pendingPages.length}</div>
          <div className="text-sm text-gray-400">pages en attente</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Cadence</div>
          <div className="text-3xl font-bold text-gray-900">{pagesPerDay}</div>
          <div className="text-sm text-gray-400">pages / jour</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Statut</div>
          <div className={`text-3xl font-bold ${config?.is_active ? 'text-green-600' : 'text-gray-400'}`}>
            {config?.is_active ? 'Actif' : 'Inactif'}
          </div>
          {config?.last_run_at && (
            <div className="text-sm text-gray-400">
              Dernière exécution: {formatDate(config.last_run_at)}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Configuration</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pages par jour</label>
            <input
              type="number"
              value={pagesPerDay}
              onChange={(e) => setPagesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={100}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
            />
          </div>
          <button
            onClick={saveConfig}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium"
          >
            Enregistrer
          </button>
          <button
            onClick={toggleActive}
            className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 ${config?.is_active ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {config?.is_active ? <><Pause className="w-4 h-4" /> Suspendre</> : <><Play className="w-4 h-4" /> Activer</>}
          </button>
          <button
            onClick={publishNow}
            disabled={isPublishing || pendingPages.length === 0}
            className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Publier maintenant
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          La publication automatique nécessite un cron job externe qui appelle /api/publish.
          Le bouton &quot;Publier maintenant&quot; effectue une publication manuelle immédiate.
        </p>
      </div>

      {/* Pending queue */}
      {pendingPages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-gray-900">File d&apos;attente ({pendingPages.length})</h2>
          </div>
          <div className="space-y-2">
            {pendingPages.map((page, index) => (
              <div key={page.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                <span className="text-sm text-gray-400 w-6">#{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{page.title}</div>
                  <div className="text-xs text-gray-400 font-mono">/{page.slug}</div>
                </div>
                <StatusBadge status={page.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently published */}
      {recentPublished.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="font-bold text-gray-900">Récemment publiées</h2>
          </div>
          <div className="space-y-2">
            {recentPublished.map((page) => (
              <div key={page.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{page.title}</div>
                  <div className="text-xs text-gray-400 font-mono">/{page.slug}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {page.published_at ? formatDate(page.published_at) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
