'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, Trash2, Eye, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import type { MediaFile } from '@/types/database';

export default function MediaGallery() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des médias');
      console.error(error);
    } else {
      setMediaFiles(data || []);
    }
    setIsLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    const supabase = createClient();

    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        toast.error(`Erreur upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('media_files').insert({
        file_name: file.name,
        file_path: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        alt_text: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      });

      if (dbError) {
        toast.error(`Erreur BDD ${file.name}: ${dbError.message}`);
      } else {
        toast.success(`${file.name} téléchargé`);
      }
    }

    setIsUploading(false);
    loadMedia();
    e.target.value = '';
  };

  const handleDelete = async (id: string, filePath: string) => {
    const supabase = createClient();
    
    const pathMatch = filePath.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
    const storagePath = pathMatch ? pathMatch[1] : null;

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([storagePath]);

      if (storageError) {
        console.warn('Storage delete error:', storageError);
      }
    }

    const { error: dbError } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);

    if (dbError) {
      toast.error('Erreur lors de la suppression');
      console.error(dbError);
      return;
    }

    toast.success('Média supprimé');
    setDeleteConfirm(null);
    loadMedia();
  };

  const handleUpdateAltText = async (id: string, altText: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('media_files')
      .update({ alt_text: altText })
      .eq('id', id);

    if (error) {
      toast.error('Erreur mise à jour alt text');
      console.error(error);
      return;
    }

    toast.success('Alt text mis à jour');
    loadMedia();
  };

  const filteredMedia = mediaFiles.filter((file) => {
    const matchesSearch = 
      file.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.alt_text?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'image' && file.file_type.startsWith('image/')) ||
      (typeFilter === 'video' && file.file_type.startsWith('video/')) ||
      (typeFilter === 'document' && !file.file_type.startsWith('image/') && !file.file_type.startsWith('video/'));

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
  const paginatedMedia = filteredMedia.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Médiathèque</h2>
          <p className="text-sm text-gray-600 mt-1">{mediaFiles.length} fichier{mediaFiles.length > 1 ? 's' : ''}</p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium cursor-pointer transition-colors">
          {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" />Upload...</> : <><Upload className="w-4 h-4" />Uploader</>}
          <input type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" onChange={handleUpload} className="hidden" disabled={isUploading} />
        </label>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 bg-white">
          <option value="all">Tous les types</option>
          <option value="image">Images</option>
          <option value="video">Vidéos</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucun média trouvé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedMedia.map((file) => (
              <div key={file.id} className="group relative bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-900 transition-colors">
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {file.file_type.startsWith('image/') ? (
                    <img src={file.file_path} alt={file.alt_text || file.file_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-center p-4"><ImageIcon className="w-12 h-12 mx-auto mb-2" /><p className="text-xs break-words">{file.file_type}</p></div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.file_name}>{file.file_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.file_size)}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setPreviewFile(file)} className="p-1.5 bg-white hover:bg-gray-100 rounded-lg shadow-sm" title="Prévisualiser"><Eye className="w-4 h-4 text-gray-600" /></button>
                  <button onClick={() => setDeleteConfirm(file.id)} className="p-1.5 bg-white hover:bg-red-50 rounded-lg shadow-sm" title="Supprimer"><Trash2 className="w-4 h-4 text-red-600" /></button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
              <span className="text-sm text-gray-600">Page {page} sur {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
            </div>
          )}
        </>
      )}

      {previewFile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{previewFile.file_name}</h3>
              <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {previewFile.file_type.startsWith('image/') ? (
                <img src={previewFile.file_path} alt={previewFile.alt_text || previewFile.file_name} className="max-w-full mx-auto rounded-lg" />
              ) : (
                <div className="text-center text-gray-500 py-12"><ImageIcon className="w-16 h-16 mx-auto mb-4" /><p>Aperçu non disponible</p></div>
              )}
              <div className="mt-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif</label>
                  <input type="text" value={previewFile.alt_text || ''} onChange={(e) => setPreviewFile({ ...previewFile, alt_text: e.target.value })} onBlur={(e) => handleUpdateAltText(previewFile.id, e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Taille:</span><span className="ml-2 font-medium">{formatFileSize(previewFile.file_size)}</span></div>
                  <div><span className="text-gray-600">Type:</span><span className="ml-2 font-medium">{previewFile.file_type}</span></div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">URL:</span>
                  <div className="flex gap-2 mt-1">
                    <input type="text" value={previewFile.file_path} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono" />
                    <button onClick={() => { navigator.clipboard.writeText(previewFile.file_path); toast.success('URL copiée'); }} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Copier</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <ConfirmDialog isOpen={true} title="Supprimer le média" message="Êtes-vous sûr de vouloir supprimer ce fichier ?" confirmLabel="Supprimer" onConfirm={() => { const file = mediaFiles.find((f) => f.id === deleteConfirm); if (file) handleDelete(file.id, file.file_path); }} onCancel={() => setDeleteConfirm(null)} />
      )}
    </div>
  );
}
