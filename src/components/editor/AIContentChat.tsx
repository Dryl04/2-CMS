'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, Loader2, Settings2, X, Sparkles, Check, 
  PlusCircle, Plus, Trash2, XCircle, TestTube, CheckCircle,
  Settings, FileCode, FileText, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import type { SectionType } from '@/types/database';

type AIProvider = 'claude' | 'chatgpt' | 'gemini' | string;

interface CustomAIModel {
  id: string;
  name: string;
  apiKey: string;
  modelName: string; // Ex: "deepseek/DeepSeek-V3-0324" pour GitHub Models
}

type ContentScope = 'html' | 'text' | 'both';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  html?: string;
  tested?: boolean; // Code testé mais pas encore accepté
}

interface AIContentChatProps {
  currentContent: string;
  onApplyContent: (html: string) => void;
  currentSectionType?: SectionType;
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  pageHeadings?: {
    h1?: string;
    h2?: string;
  };
}

const PROVIDER_LABELS: Record<AIProvider, string> = {
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
};

const PROVIDER_COLORS: Record<AIProvider, string> = {
  claude: 'bg-orange-100 text-orange-700',
  chatgpt: 'bg-green-100 text-green-700',
  gemini: 'bg-blue-100 text-blue-700',
};

const STORAGE_KEY_PROVIDER = 'ai-chat-provider';
const STORAGE_KEY_API_KEY_PREFIX = 'ai-chat-key-';
const STORAGE_KEY_CUSTOM_MODELS = 'ai-custom-models';
const STORAGE_KEY_CUSTOM_MODEL_KEY = 'ai-custom-model-key-';
/** Max characters of existing page content to send as context to the AI */
const MAX_CONTEXT_LENGTH = 2000;

// Prompts suggérés par type de section
const SECTION_PROMPTS: Record<SectionType, string[]> = {
  hero: [
    'Crée un hero moderne avec gradient bleu et violet',
    'Génère un hero minimaliste avec fond blanc et image',
    'Crée un hero avec vidéo en arrière-plan',
  ],
  rich_text: [
    'Rédige 3 paragraphes sur les avantages de notre service',
    'Crée une introduction engageante pour un article de blog',
    'Génère un texte explicatif avec des bullet points',
  ],
  image_text: [
    'Crée une section avec image à gauche et texte à droite',
    'Génère un layout alterné avec 2 blocs image/texte',
    'Crée une section avec image circulaire et description',
  ],
  cta: [
    'Génère un CTA avec fond sombre et 2 boutons',
    'Crée un appel à l\'action avec timer de compte à rebours',
    'Génère un CTA minimaliste avec un seul bouton centré',
  ],
  faq: [
    'Crée une FAQ avec 5 questions/réponses dépliables',
    'Génère une FAQ en 2 colonnes avec 8 questions',
    'Crée une FAQ avec icônes et animations',
  ],
  testimonials: [
    'Génère 3 témoignages clients avec avatar et notation',
    'Crée un carrousel de témoignages avec citations',
    'Génère une grille de 4 avis clients avec photos',
  ],
  gallery: [
    'Crée une galerie 3x3 d\'images avec hover effet',
    'Génère une grille masonry de photos',
    'Crée un portfolio avec filtres par catégorie',
  ],
  features: [
    'Génère une grille de 6 fonctionnalités avec icônes',
    'Crée 3 cartes de fonctionnalités principales',
    'Génère une liste de features avec checkmarks',
  ],
  stats: [
    'Crée 4 statistiques impressionnantes avec chiffres animés',
    'Génère des KPIs avec graphiques et couleurs',
    'Crée une section de métriques avec icônes',
  ],
  contact: [
    'Génère un formulaire de contact avec validation',
    'Crée une section contact avec carte et infos',
    'Génère un formulaire moderne avec champs stylisés',
  ],
};

const DEFAULT_PROMPTS = [
  'Crée un hero moderne avec un gradient bleu',
  'Génère une section FAQ avec 5 questions',
  'Crée une grille de 3 fonctionnalités avec icônes',
];

export default function AIContentChat({ 
  currentContent, 
  onApplyContent, 
  currentSectionType,
  seoMetadata,
  pageHeadings
}: AIContentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('chatgpt');
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customModels, setCustomModels] = useState<CustomAIModel[]>([]);
  const [showAddCustomModel, setShowAddCustomModel] = useState(false);
  const [newCustomModel, setNewCustomModel] = useState({ name: '', apiKey: '', modelName: '' });
  
  // Nouvelles features
  const [includeSEO, setIncludeSEO] = useState(true);
  const [contentScope, setContentScope] = useState<ContentScope>('both');
  const [showScopeSettings, setShowScopeSettings] = useState(false);
  const [includeHeadings, setIncludeHeadings] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved settings
  useEffect(() => {
    try {
      // Load custom models
      const savedCustomModels = localStorage.getItem(STORAGE_KEY_CUSTOM_MODELS);
      if (savedCustomModels) {
        setCustomModels(JSON.parse(savedCustomModels));
      }

      const savedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER) as AIProvider | null;
      if (savedProvider) {
        const isStandardProvider = ['claude', 'chatgpt', 'gemini'].includes(savedProvider as string);
        const isCustomProvider = savedCustomModels && JSON.parse(savedCustomModels).some((m: CustomAIModel) => m.id === savedProvider);
        
        if (isStandardProvider || isCustomProvider) {
          setProvider(savedProvider);
          const savedKey = localStorage.getItem(STORAGE_KEY_API_KEY_PREFIX + savedProvider) || '';
          setApiKey(savedKey);
        }
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Update API key when provider changes
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(STORAGE_KEY_API_KEY_PREFIX + provider);
      if (savedKey) {
        setApiKey(savedKey);
      } else {
        // Check custom models
        const customModel = customModels.find(m => m.id === provider);
        if (customModel) {
          setApiKey(customModel.apiKey);
        } else {
          setApiKey('');
        }
      }
    } catch {
      // localStorage not available
    }
  }, [provider, customModels]);

  const addCustomModel = () => {
    if (!newCustomModel.name.trim() || !newCustomModel.apiKey.trim() || !newCustomModel.modelName.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const id = `custom-${Date.now()}`;
      const newModel: CustomAIModel = {
        id,
        name: newCustomModel.name.trim(),
        apiKey: newCustomModel.apiKey.trim(),
        modelName: newCustomModel.modelName.trim(),
      };

      const updatedModels = [...customModels, newModel];
      setCustomModels(updatedModels);
      localStorage.setItem(STORAGE_KEY_CUSTOM_MODELS, JSON.stringify(updatedModels));
      localStorage.setItem(STORAGE_KEY_API_KEY_PREFIX + id, newModel.apiKey);

      setNewCustomModel({ name: '', apiKey: '', modelName: '' });
      setShowAddCustomModel(false);
      setProvider(id);
      toast.success(`Modèle IA "${newModel.name}" ajouté avec succès`);
    } catch (err) {
      toast.error('Erreur lors de l\'ajout du modèle');
    }
  };

  const deleteCustomModel = (id: string) => {
    try {
      const updatedModels = customModels.filter(m => m.id !== id);
      setCustomModels(updatedModels);
      localStorage.setItem(STORAGE_KEY_CUSTOM_MODELS, JSON.stringify(updatedModels));
      localStorage.removeItem(STORAGE_KEY_API_KEY_PREFIX + id);

      if (provider === id) {
        setProvider('chatgpt');
      }
      toast.success('Modèle supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
      localStorage.setItem(STORAGE_KEY_API_KEY_PREFIX + provider, apiKey);
    } catch {
      // localStorage not available
    }
    setShowSettings(false);
    toast.success('Configuration IA sauvegardée');
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (!apiKey.trim()) {
      setShowSettings(true);
      toast.error('Veuillez configurer votre clé API');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Récupérer le nom du modèle si c'est un custom model
      const customModel = customModels.find(m => m.id === provider);
      const modelName = customModel?.modelName;

      // Construire le contexte selon les options
      let contextParts: string[] = [];
      
      if (currentContent && currentContent.trim()) {
        const contentPreview = currentContent.substring(0, MAX_CONTEXT_LENGTH);
        
        if (contentScope === 'html' || contentScope === 'both') {
          contextParts.push(`Contenu HTML actuel:\n${contentPreview}`);
        }
        if (contentScope === 'text' || contentScope === 'both') {
          contextParts.push(`Tu peux modifier le texte pour l'optimisation SEO.`);
        }
        if (contentScope === 'html') {
          contextParts.push(`⚠️ Ne modifie que le HTML/CSS, garde le texte intact.`);
        }
        if (contentScope === 'text') {
          contextParts.push(`⚠️ Ne modifie que le texte pour le SEO, garde la structure HTML intacte.`);
        }
      }
      
      if (includeSEO && seoMetadata) {
        const seoContext = [
          seoMetadata.title && `Titre SEO: ${seoMetadata.title}`,
          seoMetadata.description && `Description: ${seoMetadata.description}`,
          seoMetadata.keywords?.length && `Mots-clés: ${seoMetadata.keywords.join(', ')}`
        ].filter(Boolean).join('\n');
        
        if (seoContext) {
          contextParts.push(`\nInformations SEO de la page:\n${seoContext}`);
        }
      }

      if (includeHeadings && pageHeadings && (pageHeadings.h1 || pageHeadings.h2)) {
        const headingContext = [
          pageHeadings.h1 && `H1: ${pageHeadings.h1}`,
          pageHeadings.h2 && `H2: ${pageHeadings.h2}`
        ].filter(Boolean).join('\n');
        
        if (headingContext) {
          contextParts.push(`\nIntègre ces titres dans le design avec une mise en forme cohérente:\n${headingContext}\n⚠️ Pour éviter les doublons, génère le contenu SANS répéter ces titres.`);
        }
      }

      const fullContext = contextParts.length > 0 ? contextParts.join('\n\n') : undefined;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          provider,
          apiKey,
          modelName,
          context: fullContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de génération');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.raw || data.html,
        html: data.html,
        tested: false,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Erreur: ${message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Nouvelles actions pour les messages
  const handleTestContent = (index: number, html: string) => {
    onApplyContent(html);
    setMessages(prev => prev.map((msg, i) => 
      i === index && msg.role === 'assistant' ? { ...msg, tested: true } : msg
    ));
    toast.success('Code testé - Visible dans l\'éditeur');
  };

  const handleAcceptContent = (index: number, html: string) => {
    onApplyContent(html);
    setMessages(prev => prev.filter((_, i) => i !== index));
    toast.success('Code accepté et appliqué');
  };

  const handleRejectContent = (index: number) => {
    // Si le code était testé, on pourrait restaurer le contenu précédent
    // Mais pour l'instant on supprime juste le message
    setMessages(prev => prev.filter((_, i) => i !== index));
    toast.info('Suggestion refusée');
  };

  const handleAddContent = (html: string) => {
    onApplyContent(currentContent + '\n' + html);
    toast.success('Contenu ajouté à la suite');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#0E3A5D] to-[#1a5a8a] hover:shadow-2xl text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 group sm:p-4 p-3"
        title="Ouvrir l'Assistant IA"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform sm:w-6 sm:h-6 w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[28rem] max-w-[calc(100vw-3rem)] max-h-[85vh] sm:max-h-[85vh] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden sm:w-[28rem] w-[calc(100vw-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0E3A5D] to-[#1a5a8a] text-white">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Bot className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold text-sm truncate">Assistant IA</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${PROVIDER_COLORS[provider]} flex-shrink-0 max-w-[80px] truncate`}>
            {PROVIDER_LABELS[provider] || customModels.find(m => m.id === provider)?.name || 'Custom'}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowScopeSettings(!showScopeSettings)}
            className={`p-1.5 hover:bg-white/20 rounded-lg transition-colors ${showScopeSettings ? 'bg-white/20' : ''}`}
            title="Options de contexte"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 hover:bg-white/20 rounded-lg transition-colors ${showSettings ? 'bg-white/20' : ''}`}
            title="Configuration"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scope Settings Panel */}
      {showScopeSettings && (
        <div className="p-3 border-b border-gray-200 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Options de contexte
            </h3>
          </div>
          
          <div className="space-y-2">
            {/* Include SEO Toggle */}
            {seoMetadata && (
              <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                  Inclure métadonnées SEO
                </span>
                <input
                  type="checkbox"
                  checked={includeSEO}
                  onChange={(e) => setIncludeSEO(e.target.checked)}
                  className="w-4 h-4 text-[#0E3A5D] rounded focus:ring-2 focus:ring-[#0E3A5D]/20"
                />
              </label>
            )}

            {/* Include Headings Toggle */}
            {pageHeadings && (pageHeadings.h1 || pageHeadings.h2) && (
              <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-500" />
                  Intégrer H1/H2 au design
                </span>
                <input
                  type="checkbox"
                  checked={includeHeadings}
                  onChange={(e) => setIncludeHeadings(e.target.checked)}
                  className="w-4 h-4 text-[#0E3A5D] rounded focus:ring-2 focus:ring-[#0E3A5D]/20"
                />
              </label>
            )}

            {/* Content Scope */}
            {currentContent && (
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                <label className="text-xs font-medium text-gray-700 mb-2 block">
                  Partie à modifier :
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setContentScope('html')}
                    className={`px-2 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                      contentScope === 'html'
                        ? 'bg-[#0E3A5D] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FileCode className="w-3 h-3 mx-auto mb-0.5" />
                    HTML
                  </button>
                  <button
                    onClick={() => setContentScope('text')}
                    className={`px-2 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                      contentScope === 'text'
                        ? 'bg-[#0E3A5D] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FileText className="w-3 h-3 mx-auto mb-0.5" />
                    Texte
                  </button>
                  <button
                    onClick={() => setContentScope('both')}
                    className={`px-2 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                      contentScope === 'both'
                        ? 'bg-[#0E3A5D] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Layers className="w-3 h-3 mx-auto mb-0.5" />
                    Les deux
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3 max-h-[60vh] overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Settings2 className="w-4 h-4" />
            Configuration IA
          </h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Modèle IA</label>
            <div className="flex gap-2">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0E3A5D] focus:ring-2 focus:ring-[#0E3A5D]/10 bg-white transition-all"
              >
                <option value="chatgpt">ChatGPT (GPT-4o)</option>
                <option value="claude">Claude (Sonnet)</option>
                <option value="gemini">Gemini (Flash)</option>
                {customModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddCustomModel(!showAddCustomModel)}
                className="px-3 py-2 bg-[#0E3A5D] hover:bg-[#0a2847] text-white rounded-lg text-sm font-medium flex items-center gap-1 transition-colors shadow-sm"
                title="Ajouter un modèle personnalisé"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showAddCustomModel && (
            <div className="p-3 border border-blue-200 rounded-lg bg-white space-y-2.5 shadow-sm">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs font-medium text-gray-700">Modèle personnalisé</p>
                <button
                  onClick={() => setShowAddCustomModel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mb-2">
                Compatible avec GitHub Models, OpenRouter, etc.
              </p>
              <input
                type="text"
                value={newCustomModel.name}
                onChange={(e) => setNewCustomModel({...newCustomModel, name: e.target.value})}
                placeholder="Nom (ex: DeepSeek V3)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0E3A5D] focus:ring-2 focus:ring-[#0E3A5D]/10"
              />
              <input
                type="text"
                value={newCustomModel.modelName}
                onChange={(e) => setNewCustomModel({...newCustomModel, modelName: e.target.value})}
                placeholder="ID du modèle (ex: deepseek/DeepSeek-V3-0324)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0E3A5D] focus:ring-2 focus:ring-[#0E3A5D]/10"
              />
              <input
                type="password"
                value={newCustomModel.apiKey}
                onChange={(e) => setNewCustomModel({...newCustomModel, apiKey: e.target.value})}
                placeholder="Clé API / Token"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0E3A5D] focus:ring-2 focus:ring-[#0E3A5D]/10"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={addCustomModel}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => {
                    setShowAddCustomModel(false);
                    setNewCustomModel({ name: '', apiKey: '', modelName: '' });
                  }}
                  className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {customModels.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Modèles personnalisés</p>
              <div className="space-y-1.5 bg-white p-2 rounded-lg max-h-40 overflow-y-auto border border-gray-200 shadow-sm">
                {customModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-xs font-medium text-gray-700 truncate">{model.name}</p>
                      <p className="text-[10px] text-gray-500 truncate" title={model.modelName}>
                        {model.modelName}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteCustomModel(model.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded flex-shrink-0 transition-colors"
                      title="Supprimer ce modèle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Clé API {PROVIDER_LABELS[provider as string] || customModels.find(m => m.id === provider)?.name || 'personnalisée'}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Entrez votre clé API...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0E3A5D] focus:ring-2 focus:ring-[#0E3A5D]/10 bg-white"
            />
            <p className="mt-1.5 text-[10px] text-gray-500">
              🔒 Stockée localement dans votre navigateur
            </p>
          </div>
          
          <button
            onClick={saveSettings}
            className="w-full bg-gradient-to-r from-[#0E3A5D] to-[#1a5a8a] hover:shadow-lg text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          >
            Sauvegarder la configuration
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] bg-gray-50/50">
        {messages.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="bg-[#0E3A5D] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Bienvenue sur l'Assistant IA
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {currentSectionType 
                ? `Suggestions pour une section "${currentSectionType}"` 
                : 'Décrivez le contenu que vous souhaitez générer'}
            </p>
            <div className="mt-3 space-y-1.5 max-h-[200px] overflow-y-auto">
              {(currentSectionType ? SECTION_PROMPTS[currentSectionType] : DEFAULT_PROMPTS).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="block w-full text-left text-xs text-[#0E3A5D] hover:bg-white hover:shadow-sm bg-white/60 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-blue-200"
                >
                  💡 {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#0E3A5D] to-[#1a5a8a] text-white px-4 py-2.5 shadow-md'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              {msg.role === 'assistant' && msg.html ? (
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <p className="text-xs font-medium text-gray-600">Contenu généré</p>
                    {msg.tested && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full ml-auto">
                        Testé
                      </span>
                    )}
                  </div>
                  
                  {/* Code Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-3 max-h-40 overflow-y-auto">
                    <pre className="text-[10px] text-gray-700 whitespace-pre-wrap break-all font-mono leading-relaxed">
                      {msg.html.length > 600 
                        ? msg.html.substring(0, 600) + '...' 
                        : msg.html}
                    </pre>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-1.5">
                    {!msg.tested ? (
                      <>
                        <button
                          onClick={() => handleTestContent(i, msg.html!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors shadow-sm"
                          title="Tester le code sans l'accepter"
                        >
                          <TestTube className="w-3.5 h-3.5" />
                          Tester
                        </button>
                        <button
                          onClick={() => handleAcceptContent(i, msg.html!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium transition-colors shadow-sm"
                          title="Accepter et supprimer du chat"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accepter
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAcceptContent(i, msg.html!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium transition-colors shadow-sm"
                        title="Accepter définitivement"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Accepter
                      </button>
                    )}
                    <button
                      onClick={() => handleAddContent(msg.html!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg font-medium transition-colors shadow-sm"
                      title="Ajouter à la suite du contenu existant"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                    <button
                      onClick={() => handleRejectContent(i)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors shadow-sm"
                      title="Refuser et supprimer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Refuser
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words p-1">
                  {msg.content}
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[#0E3A5D]" />
              <span className="text-sm text-gray-600">Génération en cours...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize textarea
              if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez le contenu souhaité..."
            rows={1}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0E3A5D] focus:ring-2 focus:ring-[#0E3A5D]/10 resize-none max-h-[120px] transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-[#0E3A5D] to-[#1a5a8a] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all flex-shrink-0"
            title="Envoyer (Entrée)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {input.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-1.5 text-right">
            Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
          </p>
        )}
      </div>
    </div>
  );
}
