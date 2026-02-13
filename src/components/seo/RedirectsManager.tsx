'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ExternalLink, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { Redirect } from '@/types/database';

export default function RedirectsManager() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    source_path: '',
    destination_path: '',
    redirect_type: 301 as 301 | 302,
    is_active: true,
  });

  useEffect(() => {
    loadRedirects();
  }, []);

  const loadRedirects = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('redirects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des redirections');
      console.error(error);
    } else {
      setRedirects(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.source_path.trim() || !formData.destination_path.trim()) {
      toast.error('Les chemins source et destination sont obligatoires');
      return;
    }

    const supabase = createClient();
    
    if (editingId) {
      // Update existing redirect
      const { error } = await supabase
        .from('redirects')
        .update({
          source_path: formData.source_path.trim(),
          destination_path: formData.destination_path.trim(),
          redirect_type: formData.redirect_type,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        toast.error('Erreur lors de la mise à jour');
        console.error(error);
        return;
      }

      toast.success('Redirection mise à jour');
    } else {
      // Create new redirect
      const { error } = await supabase
        .from('redirects')
        .insert({
          source_path: formData.source_path.trim(),
          destination_path: formData.destination_path.trim(),
          redirect_type: formData.redirect_type,
          is_active: formData.is_active,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Une redirection existe déjà pour ce chemin source');
        } else {
          toast.error('Erreur lors de la création');
          console.error(error);
        }
        return;
      }

      toast.success('Redirection créée');
    }

    resetForm();
    loadRedirects();
  };

  const handleEdit = (redirect: Redirect) => {
    setFormData({
      source_path: redirect.source_path,
      destination_path: redirect.destination_path,
      redirect_type: redirect.redirect_type,
      is_active: redirect.is_active,
    });
    setEditingId(redirect.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('redirects')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
      return;
    }

    toast.success('Redirection supprimée');
    setDeleteConfirm(null);
    loadRedirects();
  };

  const toggleActive = async (redirect: Redirect) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('redirects')
      .update({
        is_active: !redirect.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', redirect.id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
      return;
    }

    toast.success(redirect.is_active ? 'Redirection désactivée' : 'Redirection activée');
    loadRedirects();
  };

  const resetForm = () => {
    setFormData({
      source_path: '',
      destination_path: '',
      redirect_type: 301,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Redirections 301/302</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les redirections pour les anciennes URLs
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle redirection
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border-2 border-gray-900 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Modifier la redirection' : 'Nouvelle redirection'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chemin source (ancien) *
              </label>
              <input
                type="text"
                value={formData.source_path}
                onChange={(e) => setFormData({ ...formData, source_path: e.target.value })}
                placeholder="blog/ancien-article"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Ne pas inclure le slash initial. Exemple: blog/ancien-article
              </p>
            </div>

            <div className="flex items-center justify-center py-2">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chemin destination (nouveau) *
              </label>
              <input
                type="text"
                value={formData.destination_path}
                onChange={(e) => setFormData({ ...formData, destination_path: e.target.value })}
                placeholder="blog/nouvel-article"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de redirection
                </label>
                <select
                  value={formData.redirect_type}
                  onChange={(e) => setFormData({ ...formData, redirect_type: Number(e.target.value) as 301 | 302 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                >
                  <option value={301}>301 - Permanente</option>
                  <option value={302}>302 - Temporaire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium"
              >
                {editingId ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {redirects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ExternalLink className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune redirection configurée</p>
            <p className="text-sm mt-1">Les redirections sont créées automatiquement lors du changement de slug</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source → Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {redirects.map((redirect) => (
                  <tr key={redirect.id} className={!redirect.is_active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                          /{redirect.source_path}
                        </code>
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                          /{redirect.destination_path}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${
                        redirect.redirect_type === 301
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {redirect.redirect_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {redirect.hit_count} fois
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(redirect)}
                        className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
                      >
                        {redirect.is_active ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-green-600" />
                            <span className="text-green-700 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(redirect)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(redirect.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Supprimer la redirection"
          message="Êtes-vous sûr de vouloir supprimer cette redirection ?"
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
