'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Save, X, Link as LinkIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { InternalLinkRule } from '@/types/database';

export default function InternalLinksRules() {
  const [rules, setRules] = useState<InternalLinkRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state for add/edit
  const [formKeyword, setFormKeyword] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formMaxOccurrences, setFormMaxOccurrences] = useState(1);

  const loadRules = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('internal_links_rules')
      .select('*')
      .order('keyword');

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      setRules(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const resetForm = () => {
    setFormKeyword('');
    setFormTarget('');
    setFormMaxOccurrences(1);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleAdd = async () => {
    if (!formKeyword.trim() || !formTarget.trim()) {
      toast.error('Mot-clé et page cible sont obligatoires');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('internal_links_rules').insert({
      keyword: formKeyword.trim(),
      target_page_key: formTarget.trim(),
      max_occurrences: formMaxOccurrences,
      is_active: true,
    });

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Règle ajoutée');
      resetForm();
      loadRules();
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formKeyword.trim() || !formTarget.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('internal_links_rules')
      .update({
        keyword: formKeyword.trim(),
        target_page_key: formTarget.trim(),
        max_occurrences: formMaxOccurrences,
      })
      .eq('id', editingId);

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Règle mise à jour');
      resetForm();
      loadRules();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase.from('internal_links_rules').delete().eq('id', deleteId);
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Règle supprimée');
      loadRules();
    }
    setDeleteId(null);
  };

  const toggleActive = async (rule: InternalLinkRule) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('internal_links_rules')
      .update({ is_active: !rule.is_active })
      .eq('id', rule.id);

    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      setRules(rules.map((r) => (r.id === rule.id ? { ...r, is_active: !r.is_active } : r)));
    }
  };

  const startEdit = (rule: InternalLinkRule) => {
    setEditingId(rule.id);
    setFormKeyword(rule.keyword);
    setFormTarget(rule.target_page_key);
    setFormMaxOccurrences(rule.max_occurrences);
    setIsAdding(false);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Maillage interne</h2>
          <p className="text-sm text-gray-500">Règles d&apos;insertion automatique de liens internes dans le contenu</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle règle
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {(isAdding || editingId) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            {editingId ? 'Modifier la règle' : 'Nouvelle règle'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot-clé *</label>
              <input
                type="text"
                value={formKeyword}
                onChange={(e) => setFormKeyword(e.target.value)}
                placeholder="Ex: assurance auto"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page cible (page_key) *</label>
              <input
                type="text"
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                placeholder="Ex: assurance-auto"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max occurrences</label>
              <input
                type="number"
                value={formMaxOccurrences}
                onChange={(e) => setFormMaxOccurrences(parseInt(e.target.value) || 1)}
                min={1}
                max={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Mettre à jour' : 'Ajouter'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <LinkIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune règle de maillage interne</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Mot-clé</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Page cible</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Max</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Actif</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className={`border-b border-gray-100 ${!rule.is_active ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4 font-medium">{rule.keyword}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{rule.target_page_key}</td>
                  <td className="py-3 px-4">{rule.max_occurrences}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleActive(rule)} className="text-gray-500 hover:text-gray-900">
                      {rule.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(rule)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(rule.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
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

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer la règle"
        message="Voulez-vous vraiment supprimer cette règle de maillage interne ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
