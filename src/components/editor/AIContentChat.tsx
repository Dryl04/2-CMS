'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, Settings2, X, Sparkles, Check, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

type AIProvider = 'claude' | 'chatgpt' | 'gemini';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  html?: string;
}

interface AIContentChatProps {
  currentContent: string;
  onApplyContent: (html: string) => void;
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
/** Max characters of existing page content to send as context to the AI */
const MAX_CONTEXT_LENGTH = 2000;

export default function AIContentChat({ currentContent, onApplyContent }: AIContentChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('chatgpt');
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved settings
  useEffect(() => {
    try {
      const savedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER) as AIProvider | null;
      if (savedProvider && ['claude', 'chatgpt', 'gemini'].includes(savedProvider)) {
        setProvider(savedProvider);
        const savedKey = localStorage.getItem(STORAGE_KEY_API_KEY_PREFIX + savedProvider) || '';
        setApiKey(savedKey);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Update API key when provider changes
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(STORAGE_KEY_API_KEY_PREFIX + provider) || '';
      setApiKey(savedKey);
    } catch {
      // localStorage not available
    }
  }, [provider]);

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
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          provider,
          apiKey,
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
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105"
        title="Assistant IA"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
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
        <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Modèle IA</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="chatgpt">ChatGPT (GPT-4o)</option>
              <option value="claude">Claude (Sonnet)</option>
              <option value="gemini">Gemini (Flash)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Clé API {PROVIDER_LABELS[provider]}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Entrez votre clé API ${PROVIDER_LABELS[provider]}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={saveSettings}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Sauvegarder
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[350px]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Décrivez le contenu que vous souhaitez générer pour votre page.
            </p>
            <div className="mt-3 space-y-1.5">
              {[
                'Crée un hero moderne avec un gradient bleu',
                'Génère une section FAQ avec 5 questions',
                'Crée une grille de 3 fonctionnalités avec icônes',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="block w-full text-left text-xs text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
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
                  ? 'bg-purple-600 text-white'
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
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-purple-500 resize-none max-h-20"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
