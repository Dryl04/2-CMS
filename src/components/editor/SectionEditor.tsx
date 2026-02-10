'use client';

import { useState, useRef, useEffect } from 'react';
import { Eye, Code } from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { sanitizeHTML } from '@/lib/sanitize';
import { countWords } from '@/lib/internal-links';
import type { TemplateSection, SectionContent } from '@/types/database';

interface SectionEditorProps {
  section: TemplateSection;
  content: SectionContent;
  onChange: (content: SectionContent) => void;
}

type SectionMode = 'visual' | 'code' | 'preview';

function SectionPreviewIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(150);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'section-preview-height' && typeof event.data.height === 'number') {
        setIframeHeight(Math.max(150, event.data.height + 20));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sanitized = sanitizeHTML(html);
  const srcdoc = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }</style>
</head>
<body>
  ${sanitized}
  <script>
    function sendHeight() {
      window.parent.postMessage({ type: 'section-preview-height', height: document.documentElement.scrollHeight }, '*');
    }
    window.addEventListener('load', sendHeight);
    setTimeout(sendHeight, 500);
    setTimeout(sendHeight, 1500);
  <\/script>
</body>
</html>`;

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0 rounded-xl"
      style={{ height: `${iframeHeight}px`, minHeight: '150px' }}
      sandbox="allow-scripts"
      srcDoc={srcdoc}
      title="Aperçu de la section"
    />
  );
}

export default function SectionEditor({ section, content, onChange }: SectionEditorProps) {
  const [mode, setMode] = useState<SectionMode>('visual');
  const wordCount = countWords(content.content || '');
  const isUnderMin = section.min_words > 0 && wordCount < section.min_words;
  const isOverMax = section.max_words > 0 && wordCount > section.max_words;

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{section.label}</h3>
          <span className="text-xs text-gray-400">{section.type}</span>
          {section.required && (
            <span className="ml-2 text-xs text-red-500 font-medium">obligatoire</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('visual')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${mode === 'visual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              <Eye className="w-3 h-3" />
              Visuel
            </button>
            <button
              type="button"
              onClick={() => setMode('code')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${mode === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              <Code className="w-3 h-3" />
              Code
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${mode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              <Eye className="w-3 h-3" />
              Aperçu
            </button>
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-lg ${isUnderMin ? 'bg-red-50 text-red-600' : isOverMax ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
            {wordCount} mot{wordCount > 1 ? 's' : ''}
            {section.min_words > 0 && ` / min ${section.min_words}`}
            {section.max_words > 0 && ` / max ${section.max_words}`}
          </div>
        </div>
      </div>

      {mode === 'visual' && (
        <RichTextEditor
          content={content.content || ''}
          onChange={(html) => onChange({ ...content, section_id: section.id, content: html })}
          placeholder={`Contenu de la section "${section.label}"...`}
        />
      )}

      {mode === 'code' && (
        <textarea
          value={content.content || ''}
          onChange={(e) => onChange({ ...content, section_id: section.id, content: e.target.value })}
          placeholder={`<div class="bg-white p-8">&#10;  <h2 class="text-2xl font-bold">Section ${section.label}</h2>&#10;</div>`}
          className="w-full h-48 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:border-gray-900 resize-y bg-gray-900 text-green-400"
          spellCheck={false}
        />
      )}

      {mode === 'preview' && (
        <div className="border-2 border-gray-200 rounded-xl overflow-hidden min-h-[150px]">
          {content.content ? (
            <SectionPreviewIframe html={content.content} />
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Aucun contenu à prévisualiser</p>
          )}
        </div>
      )}

      {(isUnderMin || isOverMax) && (
        <p className={`text-xs mt-2 ${isUnderMin ? 'text-red-500' : 'text-amber-500'}`}>
          {isUnderMin && `Le contenu doit contenir au moins ${section.min_words} mots`}
          {isOverMax && `Le contenu ne doit pas dépasser ${section.max_words} mots`}
        </p>
      )}
    </div>
  );
}
