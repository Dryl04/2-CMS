import { NextRequest, NextResponse } from 'next/server';

interface AIRequestBody {
  prompt: string;
  provider: string; // Peut être 'claude' | 'chatgpt' | 'gemini' ou un ID custom
  apiKey: string;
  context?: string;
  modelName?: string; // Pour les modèles GitHub custom
}

function buildSystemPrompt(context?: string): string {
  return `Tu es un expert en création de contenu web et design HTML/CSS. Tu génères du code HTML avec des classes Tailwind CSS pour créer des pages web modernes et professionnelles.

Règles importantes :
- Génère UNIQUEMENT du code HTML avec des classes Tailwind CSS
- N'utilise PAS de balises <html>, <head>, <body>, <script> ou <style>
- Crée du contenu visuellement attrayant et responsive
- Utilise des couleurs harmonieuses et un espacement cohérent
- Le texte doit être en français
- Pas de commentaires dans le code, seulement le HTML pur
- Utilise des composants modernes : cards, grilles, gradients, ombres, arrondis

${context ? `Contexte actuel de la page :\n${context}` : ''}`;
}

async function callClaude(prompt: string, apiKey: string, context?: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: buildSystemPrompt(context),
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Claude: ${error}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callChatGPT(prompt: string, apiKey: string, context?: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API ChatGPT: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt: string, apiKey: string, context?: string): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4096 },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Gemini: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGitHubModel(prompt: string, apiKey: string, modelName: string, context?: string): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);
  const response = await fetch(
    'https://models.github.ai/inference/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 1.0,
        top_p: 1.0,
        max_tokens: 4096,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API GitHub Model: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractHTML(text: string): string {
  const codeBlockMatch = text.match(/```(?:html)?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequestBody = await request.json();
    const { prompt, provider, apiKey, context, modelName } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Le prompt est requis' }, { status: 400 });
    }
    if (!apiKey?.trim()) {
      return NextResponse.json({ error: 'La clé API est requise' }, { status: 400 });
    }

    let result: string;
    const isStandardProvider = ['claude', 'chatgpt', 'gemini'].includes(provider);

    if (isStandardProvider) {
      // Providers standards
      switch (provider) {
        case 'claude':
          result = await callClaude(prompt, apiKey, context);
          break;
        case 'chatgpt':
          result = await callChatGPT(prompt, apiKey, context);
          break;
        case 'gemini':
          result = await callGemini(prompt, apiKey, context);
          break;
        default:
          return NextResponse.json({ error: 'Fournisseur non supporté' }, { status: 400 });
      }
    } else {
      // Modèle custom (GitHub Models)
      if (!modelName?.trim()) {
        return NextResponse.json({ error: 'Le nom du modèle est requis pour les modèles personnalisés' }, { status: 400 });
      }
      result = await callGitHubModel(prompt, apiKey, modelName, context);
    }

    const html = extractHTML(result);
    return NextResponse.json({ html, raw: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
