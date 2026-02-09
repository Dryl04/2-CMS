'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface MediaFile {
  name: string;
  url: string;
  size: number;
}

interface MediaManagerProps {
  onInsert: (url: string, alt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaManager({ onInsert, isOpen, onClose }: MediaManagerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [altText, setAltText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.storage.from('media').list('uploads', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      toast.error('Erreur de chargement: ' + error.message);
    } else if (data) {
      const mediaFiles: MediaFile[] = data
        .filter((f) => !f.name.startsWith('.'))
        .map((f) => {
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(`uploads/${f.name}`);
          return {
            name: f.name,
            url: urlData.publicUrl,
            size: f.metadata?.size || 0,
          };
        });
      setFiles(mediaFiles);
    }
    setIsLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setIsUploading(true);
    const supabase = createClient();

    for (const file of Array.from(fileList)) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from('media').upload(`uploads/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        toast.error(`Erreur: ${file.name} - ${error.message}`);
      } else {
        toast.success(`${file.name} téléchargé`);
      }
    }

    setIsUploading(false);
    loadFiles();
  };

  const handleSelect = (file: MediaFile) => {
    setSelectedFile(file);
    setAltText(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleInsert = () => {
    if (selectedFile) {
      onInsert(selectedFile.url, altText);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Médiathèque</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload zone */}
          <div className="mb-6">
            <label className="flex items-center justify-center gap-3 w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 bg-gray-50">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Télécharger des images</span>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* File grid */}
          {files.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune image</p>
              <button
                onClick={loadFiles}
                className="mt-2 text-sm text-gray-900 underline"
              >
                Charger les images existantes
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {files.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => handleSelect(file)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-colors ${selectedFile?.name === file.name ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Insert bar */}
        {selectedFile && (
          <div className="border-t border-gray-200 p-6 flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Texte alternatif (alt)</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900"
              />
            </div>
            <button
              onClick={handleInsert}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium"
            >
              Insérer
            </button>
          </div>
        )}

        {!files.length && !isLoading && (
          <div className="border-t border-gray-200 p-4 text-center">
            <button onClick={loadFiles} className="text-sm font-medium text-gray-900 hover:underline">
              Charger les images du storage
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
