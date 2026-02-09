import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, EyeOff, Plus, FileUp, FormInput } from 'lucide-react';
import { supabase, SEOMetadata } from '../lib/supabase';
import SEOImporter from './SEOImporter';
import SEOForm from './SEOForm';
import SEOPageViewer from './SEOPageViewer';

type ViewMode = 'list' | 'form' | 'import' | 'view';

export default function SEOManager() {
  const [metadata, setMetadata] = useState<SEOMetadata[]>([]);
  const [filteredMetadata, setFilteredMetadata] = useState<SEOMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPage, setEditingPage] = useState<SEOMetadata | undefined>(undefined);
  const [viewingPage, setViewingPage] = useState<SEOMetadata | undefined>(undefined);

  const loadMetadata = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_metadata')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMetadata(data || []);
      setFilteredMetadata(data || []);
    } catch (error) {
      console.error('Error loading metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    let filtered = metadata;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.page_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredMetadata(filtered);
  }, [searchQuery, statusFilter, metadata]);

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const { error } = await supabase
        .from('seo_metadata')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      loadMetadata();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette métadonnée ?')) return;

    try {
      const { error } = await supabase
        .from('seo_metadata')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadMetadata();
    } catch (error) {
      console.error('Error deleting metadata:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-emerald-100 text-emerald-700',
      archived: 'bg-orange-100 text-orange-700'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const handleEdit = (page: SEOMetadata) => {
    setEditingPage(page);
    setViewMode('form');
  };

  const handleView = (page: SEOMetadata) => {
    setViewingPage(page);
    setViewMode('view');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Gestion SEO</h1>
          <p className="text-gray-600">Gérez les métadonnées SEO de votre application</p>
        </div>

        {viewMode !== 'list' && viewMode !== 'view' && (
          <button
            onClick={() => {
              setViewMode('list');
              setEditingPage(undefined);
              setViewingPage(undefined);
            }}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2 font-medium"
          >
            <span>← Retour à la liste</span>
          </button>
        )}

        {viewMode === 'view' && viewingPage ? (
          <SEOPageViewer
            page={viewingPage}
            onEdit={() => {
              setEditingPage(viewingPage);
              setViewMode('form');
              setViewingPage(undefined);
            }}
            onBack={() => {
              setViewMode('list');
              setViewingPage(undefined);
            }}
          />
        ) : viewMode === 'form' ? (
          <SEOForm
            onSaveComplete={() => {
              loadMetadata();
              setViewMode('list');
              setEditingPage(undefined);
            }}
            editingPage={editingPage}
          />
        ) : viewMode === 'import' ? (
          <SEOImporter onImportComplete={() => {
            loadMetadata();
            setViewMode('list');
          }} />
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par page_key, titre ou description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                  />
                </div>

                <div className="flex space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>

                  <button
                    onClick={() => {
                      setEditingPage(undefined);
                      setViewMode('form');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
                  >
                    <FormInput className="w-5 h-5" />
                    <span>Créer une page</span>
                  </button>

                  <button
                    onClick={() => setViewMode('import')}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
                  >
                    <FileUp className="w-5 h-5" />
                    <span>Import en masse</span>
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Chargement...</p>
              </div>
            ) : filteredMetadata.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
                <p className="text-gray-600 mb-4">Aucune métadonnée trouvée</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setEditingPage(undefined);
                      setViewMode('form');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
                  >
                    <FormInput className="w-5 h-5" />
                    <span>Créer votre première page</span>
                  </button>
                  <button
                    onClick={() => setViewMode('import')}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2"
                  >
                    <FileUp className="w-5 h-5" />
                    <span>Import en masse</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMetadata.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl border border-gray-200 p-6 hover:border-gray-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg text-gray-700">
                            {item.page_key}
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-gray-600 mb-3">{item.description}</p>
                        )}
                        {item.keywords && item.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.keywords.map((keyword, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleView(item)}
                          className="p-2 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Visualiser"
                        >
                          <Eye className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => handleStatusChange(item.id, 'draft')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              item.status === 'draft' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                            }`}
                            title="Brouillon"
                          >
                            Draft
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'published')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              item.status === 'published' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                            }`}
                            title="Publier"
                          >
                            Publish
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'archived')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              item.status === 'archived' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                            }`}
                            title="Archiver"
                          >
                            Archive
                          </button>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {(item.og_title || item.og_description || item.og_image) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Open Graph</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {item.og_title && (
                            <div>
                              <span className="text-gray-500">Titre: </span>
                              <span className="text-gray-900">{item.og_title}</span>
                            </div>
                          )}
                          {item.og_description && (
                            <div>
                              <span className="text-gray-500">Description: </span>
                              <span className="text-gray-900">{item.og_description}</span>
                            </div>
                          )}
                          {item.og_image && (
                            <div className="col-span-2">
                              <span className="text-gray-500">Image: </span>
                              <a href={item.og_image} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">
                                {item.og_image}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                      <div>
                        {item.imported_at && (
                          <span>Importé le {new Date(item.imported_at).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                      <div>
                        Mis à jour le {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
