import { useState } from 'react';
import { Upload, FileJson, FileText, CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react';
import { supabase, SEOMetadata } from '../lib/supabase';

interface ImportedData {
  page_key: string;
  title: string;
  description?: string;
  keywords?: string | string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  language?: string;
  status?: 'draft' | 'published' | 'archived';
  content?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const TEMPLATES = {
  json: {
    nouvelle_page: `[
  {
    "page_key": "nouvelle-page",
    "title": "Titre SEO de la nouvelle page (max 60 car.)",
    "description": "Description SEO qui apparaîtra dans les résultats Google (max 160 caractères recommandé).",
    "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3", "longue traîne exemple"],
    "og_title": "Titre pour les réseaux sociaux",
    "og_description": "Description pour Facebook, LinkedIn, etc.",
    "og_image": "https://example.com/image-1200x630.jpg",
    "canonical_url": "https://votre-site.com/nouvelle-page",
    "language": "fr",
    "status": "draft"
  }
]`,
    page_produit: `[
  {
    "page_key": "nom-du-produit",
    "title": "Nom du Produit - Bénéfice Principal | Marque",
    "description": "Découvrez notre produit révolutionnaire. Fonctionnalité 1, fonctionnalité 2. Essai gratuit disponible.",
    "keywords": ["nom produit", "catégorie produit", "solution à problème", "alternative concurrent"],
    "og_title": "Nom du Produit - Transformez votre business",
    "og_description": "La solution complète pour résoudre votre problème. Utilisé par 10,000+ clients.",
    "og_image": "https://example.com/produit-image.jpg",
    "status": "draft"
  }
]`,
    page_service: `[
  {
    "page_key": "nom-du-service",
    "title": "Service Professional - Expert depuis 20 ans | Ville",
    "description": "Expert en service X à Ville. Intervention rapide, devis gratuit, satisfaction garantie. Contactez-nous au 01 XX XX XX XX.",
    "keywords": ["service ville", "expert service", "professionnel service ville", "devis service"],
    "og_title": "Service Professional à Ville",
    "og_description": "Votre expert de confiance. Intervention sous 24h.",
    "status": "draft"
  }
]`,
    article_blog: `[
  {
    "page_key": "titre-article-blog",
    "title": "Guide Complet 2024 : Comment [Sujet] en 5 Étapes",
    "description": "Découvrez notre guide complet pour maîtriser [sujet]. Conseils d'experts, exemples concrets et astuces pratiques.",
    "keywords": ["guide sujet", "comment sujet", "tutoriel sujet", "conseils sujet", "astuces sujet"],
    "og_title": "Le Guide Ultime pour [Sujet]",
    "og_description": "Tout ce que vous devez savoir sur [sujet] en 2024.",
    "og_image": "https://example.com/article-cover.jpg",
    "status": "draft"
  }
]`,
    multiple_pages: `[
  {
    "page_key": "home",
    "title": "NetworkPro - Transformez vos contacts en clients | CRM",
    "description": "Gérez vos contacts professionnels efficacement. Scanner de cartes, suivi automatisé et pipeline commercial. Essai gratuit 14 jours.",
    "keywords": ["gestion contacts", "CRM mobile", "scanner carte visite", "networking professionnel"],
    "status": "published"
  },
  {
    "page_key": "pricing",
    "title": "Tarifs NetworkPro - Plans à partir de 0€",
    "description": "Découvrez nos offres flexibles. Essai gratuit sans engagement. Plans adaptés aux freelances, TPE et PME.",
    "keywords": ["tarifs CRM", "prix gestion contacts", "abonnement networking"],
    "status": "published"
  },
  {
    "page_key": "features",
    "title": "Fonctionnalités NetworkPro - CRM Mobile Complet",
    "description": "Scanner de cartes, événements, pipeline commercial, notifications intelligentes et plus encore.",
    "keywords": ["fonctionnalités CRM", "scanner cartes", "gestion événements"],
    "status": "draft"
  }
]`
  },
  csv: {
    nouvelle_page: `page_key,title,description,keywords,og_title,og_description,og_image,canonical_url,language,status
nouvelle-page,Titre SEO de la nouvelle page (max 60 car.),Description SEO qui apparaîtra dans les résultats Google (max 160 caractères recommandé).,mot-clé 1;mot-clé 2;mot-clé 3;longue traîne exemple,Titre pour les réseaux sociaux,Description pour Facebook LinkedIn etc.,https://example.com/image-1200x630.jpg,https://votre-site.com/nouvelle-page,fr,draft`,
    page_produit: `page_key,title,description,keywords,og_title,og_description,og_image,status
nom-du-produit,Nom du Produit - Bénéfice Principal | Marque,Découvrez notre produit révolutionnaire. Fonctionnalité 1 fonctionnalité 2. Essai gratuit disponible.,nom produit;catégorie produit;solution à problème;alternative concurrent,Nom du Produit - Transformez votre business,La solution complète pour résoudre votre problème. Utilisé par 10000+ clients.,https://example.com/produit-image.jpg,draft`,
    page_service: `page_key,title,description,keywords,og_title,og_description,status
nom-du-service,Service Professional - Expert depuis 20 ans | Ville,Expert en service X à Ville. Intervention rapide devis gratuit satisfaction garantie. Contactez-nous.,service ville;expert service;professionnel service ville;devis service,Service Professional à Ville,Votre expert de confiance. Intervention sous 24h.,draft`,
    article_blog: `page_key,title,description,keywords,og_title,og_description,og_image,status
titre-article-blog,Guide Complet 2024 : Comment [Sujet] en 5 Étapes,Découvrez notre guide complet pour maîtriser [sujet]. Conseils d'experts exemples concrets et astuces pratiques.,guide sujet;comment sujet;tutoriel sujet;conseils sujet;astuces sujet,Le Guide Ultime pour [Sujet],Tout ce que vous devez savoir sur [sujet] en 2024.,https://example.com/article-cover.jpg,draft`,
    multiple_pages: `page_key,title,description,keywords,status
home,NetworkPro - Transformez vos contacts en clients | CRM,Gérez vos contacts professionnels efficacement. Scanner de cartes suivi automatisé et pipeline commercial. Essai gratuit 14 jours.,gestion contacts;CRM mobile;scanner carte visite;networking professionnel,published
pricing,Tarifs NetworkPro - Plans à partir de 0€,Découvrez nos offres flexibles. Essai gratuit sans engagement. Plans adaptés aux freelances TPE et PME.,tarifs CRM;prix gestion contacts;abonnement networking,published
features,Fonctionnalités NetworkPro - CRM Mobile Complet,Scanner de cartes événements pipeline commercial notifications intelligentes et plus encore.,fonctionnalités CRM;scanner cartes;gestion événements,draft`
  }
};

export default function SEOImporter({ onImportComplete }: { onImportComplete: () => void }) {
  const [importType, setImportType] = useState<'json' | 'csv'>('json');
  const [inputData, setInputData] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewData, setPreviewData] = useState<ImportedData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const validateData = (data: ImportedData[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((item, index) => {
      if (!item.page_key || item.page_key.trim() === '') {
        errors.push({ row: index + 1, field: 'page_key', message: 'page_key est obligatoire' });
      }
      if (!item.title || item.title.trim() === '') {
        errors.push({ row: index + 1, field: 'title', message: 'title est obligatoire' });
      }
      if (item.title && item.title.length > 60) {
        errors.push({ row: index + 1, field: 'title', message: 'title ne doit pas dépasser 60 caractères' });
      }
      if (item.description && item.description.length > 160) {
        errors.push({ row: index + 1, field: 'description', message: 'description ne doit pas dépasser 160 caractères' });
      }
      if (item.status && !['draft', 'published', 'archived'].includes(item.status)) {
        errors.push({ row: index + 1, field: 'status', message: 'status doit être draft, published ou archived' });
      }
    });

    return errors;
  };

  const parseCSV = (csv: string): ImportedData[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data: ImportedData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const item: any = {};

      headers.forEach((header, index) => {
        if (values[index]) {
          if (header === 'keywords') {
            item[header] = values[index].split(';').map(k => k.trim());
          } else {
            item[header] = values[index];
          }
        }
      });

      data.push(item);
    }

    return data;
  };

  const handleValidate = () => {
    setIsValidating(true);
    setValidationErrors([]);
    setPreviewData([]);

    try {
      let parsedData: ImportedData[] = [];

      if (importType === 'json') {
        parsedData = JSON.parse(inputData);
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      } else {
        parsedData = parseCSV(inputData);
      }

      const normalizedData = parsedData.map(item => ({
        ...item,
        keywords: typeof item.keywords === 'string'
          ? item.keywords.split(',').map(k => k.trim())
          : item.keywords || []
      }));

      const errors = validateData(normalizedData);
      setValidationErrors(errors);
      setPreviewData(normalizedData);
    } catch (error) {
      setValidationErrors([{ row: 0, field: 'format', message: `Erreur de format: ${error}` }]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const dataToImport = previewData.map(item => ({
        page_key: item.page_key,
        title: item.title,
        description: item.description || null,
        keywords: item.keywords || [],
        og_title: item.og_title || null,
        og_description: item.og_description || null,
        og_image: item.og_image || null,
        canonical_url: item.canonical_url || null,
        language: item.language || 'fr',
        status: item.status || 'draft',
        content: item.content || null,
        imported_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('seo_metadata')
        .upsert(dataToImport, { onConflict: 'page_key' });

      if (error) throw error;

      setImportSuccess(true);
      setInputData('');
      setPreviewData([]);
      setTimeout(() => {
        setImportSuccess(false);
        onImportComplete();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      setValidationErrors([{ row: 0, field: 'import', message: `Erreur d'import: ${error}` }]);
    } finally {
      setIsImporting(false);
    }
  };

  const loadTemplate = (templateKey: string) => {
    const template = TEMPLATES[importType][templateKey as keyof typeof TEMPLATES.json];
    setInputData(template);
    setShowTemplates(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Importer des métadonnées SEO</h3>
          <p className="text-sm text-gray-600 mt-1">
            Créez de nouvelles pages ou modifiez des pages existantes en important vos données
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setImportType('json')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              importType === 'json'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => setImportType('csv')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              importType === 'csv'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-blue-900">
            <p className="font-semibold mb-1">Comment utiliser l'import :</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li><strong>Créer une nouvelle page</strong> : Utilisez un page_key unique</li>
              <li><strong>Modifier une page existante</strong> : Utilisez le même page_key pour écraser les données</li>
              <li><strong>Import multiple</strong> : Importez plusieurs pages à la fois en format tableau</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center space-x-2 text-gray-900 hover:text-gray-700 font-medium"
        >
          <Sparkles className="w-5 h-5" />
          <span>{showTemplates ? 'Masquer les templates' : 'Utiliser un template d\'exemple'}</span>
        </button>
      </div>

      {showTemplates && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-semibold text-gray-900 mb-3">Choisissez un template :</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => loadTemplate('nouvelle_page')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all text-left"
            >
              <div className="font-medium text-gray-900 text-sm mb-1">Nouvelle page</div>
              <div className="text-xs text-gray-600">Template de base pour créer une page</div>
            </button>
            <button
              onClick={() => loadTemplate('page_produit')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all text-left"
            >
              <div className="font-medium text-gray-900 text-sm mb-1">Page produit</div>
              <div className="text-xs text-gray-600">Pour une page de présentation produit</div>
            </button>
            <button
              onClick={() => loadTemplate('page_service')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all text-left"
            >
              <div className="font-medium text-gray-900 text-sm mb-1">Page service</div>
              <div className="text-xs text-gray-600">Pour une page de service professionnel</div>
            </button>
            <button
              onClick={() => loadTemplate('article_blog')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all text-left"
            >
              <div className="font-medium text-gray-900 text-sm mb-1">Article blog</div>
              <div className="text-xs text-gray-600">Pour un article de blog ou guide</div>
            </button>
            <button
              onClick={() => loadTemplate('multiple_pages')}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-900 hover:shadow-sm transition-all text-left"
            >
              <div className="font-medium text-gray-900 text-sm mb-1">Pages multiples</div>
              <div className="text-xs text-gray-600">Import de plusieurs pages à la fois</div>
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Collez vos données {importType.toUpperCase()} ou utilisez un template
        </label>
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder={
            importType === 'json'
              ? '[{"page_key": "home", "title": "Titre SEO", "description": "Description", "keywords": ["mot1", "mot2"]}]'
              : 'page_key,title,description,keywords\nhome,Titre SEO,Description,mot1;mot2'
          }
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 font-mono text-sm"
        />
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleValidate}
          disabled={!inputData || isValidating}
          className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Valider</span>
        </button>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">Erreurs de validation</h4>
              <ul className="space-y-1 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>
                    Ligne {error.row} - {error.field}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {previewData.length > 0 && validationErrors.length === 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Aperçu ({previewData.length} entrées)</h4>
          <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-auto">
            <div className="space-y-3">
              {previewData.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-gray-900">{item.page_key}</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                      {item.status || 'draft'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{item.title}</p>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(item.keywords) ? item.keywords : [item.keywords]).map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full mt-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>{isImporting ? 'Import en cours...' : 'Importer les données'}</span>
          </button>
        </div>
      )}

      {importSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-900 font-medium">Import réussi !</span>
          </div>
        </div>
      )}
    </div>
  );
}
