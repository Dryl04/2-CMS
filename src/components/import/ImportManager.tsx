'use client';

import { useState, useCallback } from 'react';
import { Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle, X, Download } from 'lucide-react';
import Papa from 'papaparse';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils';
import type { SEOMetadata } from '@/types/database';

interface ImportError {
  row: number;
  field: string;
  message: string;
  blocking: boolean;
}

interface ImportRow {
  page_key: string;
  slug: string;
  title: string;
  meta_description: string;
  keywords: string;
  content?: string;
  h1?: string;
  h2?: string;
  canonical_url?: string;
  status?: string;
}

type ImportFormat = 'json' | 'csv';

export default function ImportManager() {
  const [format, setFormat] = useState<ImportFormat>('csv');
  const [rawData, setRawData] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const [fileName, setFileName] = useState('');

  const REQUIRED_FIELDS = ['page_key', 'slug', 'title', 'meta_description'];

  const validate = useCallback((rows: ImportRow[]): ImportError[] => {
    const errs: ImportError[] = [];
    const seenKeys = new Set<string>();
    const seenSlugs = new Set<string>();

    rows.forEach((row, i) => {
      const rowNum = i + 1;

      // Required fields
      REQUIRED_FIELDS.forEach((field) => {
        if (!row[field as keyof ImportRow]?.toString().trim()) {
          errs.push({ row: rowNum, field, message: `Champ "${field}" manquant`, blocking: true });
        }
      });

      // Duplicate page_key
      if (row.page_key) {
        if (seenKeys.has(row.page_key)) {
          errs.push({ row: rowNum, field: 'page_key', message: `page_key "${row.page_key}" en double`, blocking: true });
        }
        seenKeys.add(row.page_key);
      }

      // Duplicate slug
      if (row.slug) {
        if (seenSlugs.has(row.slug)) {
          errs.push({ row: rowNum, field: 'slug', message: `slug "${row.slug}" en double`, blocking: true });
        }
        seenSlugs.add(row.slug);
      }

      // Slug format
      if (row.slug && !/^[a-z0-9-]+$/.test(row.slug)) {
        errs.push({ row: rowNum, field: 'slug', message: `Slug invalide "${row.slug}" (utiliser a-z, 0-9, -)`, blocking: false });
      }

      // Meta description length
      if (row.meta_description && row.meta_description.length > 160) {
        errs.push({ row: rowNum, field: 'meta_description', message: `Meta description > 160 caractères (${row.meta_description.length})`, blocking: false });
      }

      // Title length
      if (row.title && row.title.length > 70) {
        errs.push({ row: rowNum, field: 'title', message: `Title > 70 caractères (${row.title.length})`, blocking: false });
      }

      // Status validation
      if (row.status && !['draft', 'pending', 'published', 'archived'].includes(row.status)) {
        errs.push({ row: rowNum, field: 'status', message: `Statut invalide "${row.status}"`, blocking: false });
      }
    });

    return errs;
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResults(null);
    setIsValidating(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;

      try {
        let rows: ImportRow[];

        if (file.name.endsWith('.json') || format === 'json') {
          const parsed = JSON.parse(text);
          rows = Array.isArray(parsed) ? parsed : parsed.pages || parsed.data || [parsed];
          setFormat('json');
        } else {
          const result = Papa.parse<ImportRow>(text, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
          });
          rows = result.data;
          setFormat('csv');
        }

        // Auto-generate slugs if missing
        rows = rows.map((row) => ({
          ...row,
          slug: row.slug?.trim() || slugify(row.title || row.page_key || ''),
          page_key: row.page_key?.trim() || slugify(row.title || ''),
          status: row.status || 'draft',
        }));

        const validationErrors = validate(rows);
        setRawData(rows);
        setErrors(validationErrors);
      } catch (err) {
        toast.error('Erreur de lecture du fichier: ' + (err instanceof Error ? err.message : 'Format invalide'));
        setRawData([]);
      }
      setIsValidating(false);
    };
    reader.readAsText(file);
  };

  const handleTextPaste = (text: string) => {
    setIsValidating(true);
    setImportResults(null);

    try {
      let rows: ImportRow[];

      // Try JSON first
      try {
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : parsed.pages || parsed.data || [parsed];
        setFormat('json');
      } catch {
        // Try CSV
        const result = Papa.parse<ImportRow>(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
        });
        rows = result.data;
        setFormat('csv');
      }

      rows = rows.map((row) => ({
        ...row,
        slug: row.slug?.trim() || slugify(row.title || row.page_key || ''),
        page_key: row.page_key?.trim() || slugify(row.title || ''),
        status: row.status || 'draft',
      }));

      const validationErrors = validate(rows);
      setRawData(rows);
      setErrors(validationErrors);
      setFileName('Collé depuis le presse-papier');
    } catch (err) {
      toast.error('Erreur de lecture: ' + (err instanceof Error ? err.message : 'Format invalide'));
    }
    setIsValidating(false);
  };

  const handleImport = async () => {
    const blockingErrors = errors.filter((e) => e.blocking);
    if (blockingErrors.length > 0) {
      toast.error(`${blockingErrors.length} erreur(s) bloquante(s) à corriger`);
      return;
    }

    setIsImporting(true);
    const supabase = createClient();
    let success = 0;
    let failed = 0;

    for (const row of rawData) {
      const record: Partial<SEOMetadata> = {
        page_key: row.page_key,
        slug: row.slug,
        title: row.title,
        meta_description: row.meta_description,
        keywords: row.keywords
          ? row.keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
        content: row.content || null,
        h1: row.h1 || row.title || null,
        h2: row.h2 || null,
        canonical_url: row.canonical_url || null,
        status: (row.status as SEOMetadata['status']) || 'draft',
        is_public: true,
      };

      const { error } = await supabase.from('seo_metadata').upsert(record, { onConflict: 'page_key' });
      if (error) {
        failed++;
      } else {
        success++;
      }
    }

    setImportResults({ success, failed });
    setIsImporting(false);

    if (failed === 0) {
      toast.success(`${success} page(s) importée(s) avec succès`);
    } else {
      toast.warning(`${success} succès, ${failed} échec(s)`);
    }
  };

  const blockingCount = errors.filter((e) => e.blocking).length;
  const warningCount = errors.filter((e) => !e.blocking).length;

  const downloadTemplate = () => {
    const template = 'page_key,slug,title,meta_description,keywords,h1,h2,content,status\nexample-page,example-page,Titre de la page,Description meta pour le SEO,"mot-clé1, mot-clé2",Titre H1,Sous-titre H2,<p>Contenu HTML</p>,draft';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import de pages</h1>
          <p className="text-gray-500 mt-1">Importez vos pages SEO en masse via CSV ou JSON</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
        >
          <Download className="w-4 h-4" />
          Télécharger le modèle CSV
        </button>
      </div>

      {/* Upload zone */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setFormat('csv')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${format === 'csv' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => setFormat('json')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${format === 'json' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
        </div>

        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600 font-medium">
            {fileName || 'Cliquez ou glissez un fichier CSV/JSON'}
          </span>
          <span className="text-xs text-gray-400 mt-1">ou collez le contenu ci-dessous</span>
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <div className="mt-4">
          <textarea
            placeholder={format === 'csv' ? 'Collez votre CSV ici...\npage_key,slug,title,meta_description,keywords' : 'Collez votre JSON ici...\n[{"page_key": "...", "slug": "...", "title": "...", "meta_description": "..."}]'}
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:border-gray-900 resize-y"
            onBlur={(e) => {
              if (e.target.value.trim()) handleTextPaste(e.target.value.trim());
            }}
          />
        </div>
      </div>

      {/* Validation results */}
      {rawData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Validation — {rawData.length} ligne(s)
            </h2>
            <div className="flex items-center gap-3">
              {blockingCount > 0 && (
                <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {blockingCount} erreur(s)
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {warningCount} avertissement(s)
                </span>
              )}
              {errors.length === 0 && (
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Validation OK
                </span>
              )}
            </div>
          </div>

          {errors.length > 0 && (
            <div className="max-h-60 overflow-y-auto mb-4 space-y-1">
              {errors.map((err, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg ${err.blocking ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}
                >
                  <span className="font-mono text-xs mt-0.5">L{err.row}</span>
                  <span className="font-medium">{err.field}:</span>
                  <span>{err.message}</span>
                  {!err.blocking && <span className="ml-auto text-xs opacity-60">(non bloquant)</span>}
                </div>
              ))}
            </div>
          )}

          {/* Preview table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-500">#</th>
                  <th className="text-left py-2 px-2 text-gray-500">page_key</th>
                  <th className="text-left py-2 px-2 text-gray-500">slug</th>
                  <th className="text-left py-2 px-2 text-gray-500">title</th>
                  <th className="text-left py-2 px-2 text-gray-500">meta_description</th>
                  <th className="text-left py-2 px-2 text-gray-500">status</th>
                </tr>
              </thead>
              <tbody>
                {rawData.slice(0, 10).map((row, i) => {
                  const rowErrors = errors.filter((e) => e.row === i + 1);
                  return (
                    <tr key={i} className={`border-b border-gray-100 ${rowErrors.some((e) => e.blocking) ? 'bg-red-50' : ''}`}>
                      <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                      <td className="py-2 px-2 font-mono text-xs">{row.page_key}</td>
                      <td className="py-2 px-2 font-mono text-xs">{row.slug}</td>
                      <td className="py-2 px-2 truncate max-w-[200px]">{row.title}</td>
                      <td className="py-2 px-2 truncate max-w-[200px]">{row.meta_description}</td>
                      <td className="py-2 px-2">{row.status || 'draft'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rawData.length > 10 && (
              <p className="text-xs text-gray-400 mt-2 text-center">... et {rawData.length - 10} autres lignes</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={isImporting || blockingCount > 0}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {isImporting ? 'Import en cours...' : `Importer ${rawData.length} page(s)`}
            </button>
            <button
              onClick={() => { setRawData([]); setErrors([]); setFileName(''); setImportResults(null); }}
              className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Import results */}
      {importResults && (
        <div className={`rounded-2xl p-6 ${importResults.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
          <h3 className="font-bold text-lg mb-2">
            {importResults.failed === 0 ? '✅ Import terminé' : '⚠️ Import terminé avec des erreurs'}
          </h3>
          <p>
            <strong>{importResults.success}</strong> page(s) importée(s) avec succès
            {importResults.failed > 0 && (
              <>, <strong className="text-red-600">{importResults.failed}</strong> échec(s)</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
