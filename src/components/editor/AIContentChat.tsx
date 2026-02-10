'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Settings2, X, Sparkles, Check, PlusCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SectionType } from '@/types/database';

type AIProvider = 'claude' | 'chatgpt' | 'gemini' | string;

interface CustomAIModel {
  id: string;
  name: string;
  apiKey: string;
  modelName: string; // Ex: "deepseek/DeepSeek-V3-0324" pour GitHub Models
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  html?: string;
}

interface AIContentChatProps {
  currentContent: string;
  onApplyContent: (html: string) => void;
  currentSectionType?: SectionType;
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

export default function AIContentChat({ currentContent, onApplyContent, currentSectionType }: AIContentChatProps) {
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

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          provider,
          apiKey,
          modelName, // Sera undefined pour les providers standards
          context: currentContent ? `Contenu HTML actuel de la page:\n${currentContent.substring(0, MAX_CONTEXT_LENGTH)}` : undefined,
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#0E3A5D] hover:bg-[#0a2847] text-white p-4 rounded-full shadow-lg transition-all hover:scale-105"
        title="Assistant IA"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0E3A5D] text-white">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">Assistant IA</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${PROVIDER_COLORS[provider]}`}>
            {PROVIDER_LABELS[provider]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Configuration"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Modèle IA</label>
            <div className="flex gap-2">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0E3A5D]"
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
                className="px-3 py-2 bg-[#0E3A5D] hover:bg-[#0a2847] text-white rounded-lg text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {showAddCustomModel && (
            <div className="p-3 border border-gray-200 rounded-lg bg-white space-y-2">
              <p className="text-xs text-gray-600 mb-2">Ajouter un modèle personnalisé depuis GitHub</p>
              <input
                type="text"
                value={newCustomModel.name}
                onChange={(e) => setNewCustomModel({...newCustomModel, name: e.target.value})}
                placeholder="Ex: DeepSeek V3"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0E3A5D]"
              />
              <input
                type="text"
                value={newCustomModel.modelName}
                onChange={(e) => setNewCustomModel({...newCustomModel, modelName: e.target.value})}
                placeholder="Ex: deepseek/DeepSeek-V3-0324"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0E3A5D]"
              />
              <input
                type="password"
                value={newCustomModel.apiKey}
                onChange={(e) => setNewCustomModel({...newCustomModel, apiKey: e.target.value})}
                placeholder="Token GitHub"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#0E3A5D]"
              />
              <div className="flex gap-2">
                <button
                  onClick={addCustomModel}
                  className="flex-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddCustomModel(false)}
                  className="flex-1 px-2 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-xs font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {customModels.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Modèles personnalisés</p>
              <div className="space-y-1.5 bg-white p-2 rounded-lg max-h-40 overflow-y-auto border border-gray-200">
                {customModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{model.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{model.modelName}</p>
                    </div>
                    <button
                      onClick={() => deleteCustomModel(model.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0 ml-2"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Clé API {PROVIDER_LABELS[provider as string] || 'personnalisée'}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Entrez votre clé API ${PROVIDER_LABELS[provider as string] || 'personnalisée'}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0E3A5D]"
            />
          </div>
          <button
            onClick={saveSettings}
            className="w-full bg-[#0E3A5D] hover:bg-[#0a2847] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Sauvegarder
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[350px]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-[#0E3A5D]/30 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {currentSectionType ? `Suggestions pour une section "${currentSectionType}"` : 'Décrivez le contenu que vous souhaitez générer pour votre page.'}
            </p>
            <div className="mt-3 space-y-1.5 max-h-[180px] overflow-y-auto">
              {(currentSectionType ? SECTION_PROMPTS[currentSectionType] : DEFAULT_PROMPTS).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="block w-full text-left text-xs text-[#0E3A5D] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
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
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#0E3A5D] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.role === 'assistant' && msg.html ? (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Contenu généré :</p>
                  <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2 max-h-32 overflow-y-auto">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words font-mono">
                      {msg.html.substring(0, 500)}{msg.html.length > 500 ? '...' : ''}
                    </pre>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        onApplyContent(msg.html!);
                        toast.success('Contenu appliqué');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium"
                    >
                      <Check className="w-3 h-3" />
                      Appliquer
                    </button>
                    <button
                      onClick={() => {
                        onApplyContent(currentContent + '\n' + msg.html!);
                        toast.success('Contenu ajouté');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium"
                    >
                      <PlusCircle className="w-3 h-3" />
                      Ajouter
                    </button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#0E3A5D]" />
              <span className="text-sm text-gray-500">Génération en cours...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez le contenu souhaité..."
            rows={1}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0E3A5D] resize-none max-h-20"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-[#0E3A5D] hover:bg-[#0a2847] disabled:bg-gray-300 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
