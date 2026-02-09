'use client';

import RichTextEditor from '@/components/ui/RichTextEditor';
import { countWords } from '@/lib/internal-links';
import type { TemplateSection, SectionContent } from '@/types/database';

interface SectionEditorProps {
  section: TemplateSection;
  content: SectionContent;
  onChange: (content: SectionContent) => void;
}

export default function SectionEditor({ section, content, onChange }: SectionEditorProps) {
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
        <div className={`text-xs font-medium px-2 py-1 rounded-lg ${isUnderMin ? 'bg-red-50 text-red-600' : isOverMax ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
          {wordCount} mot{wordCount > 1 ? 's' : ''}
          {section.min_words > 0 && ` / min ${section.min_words}`}
          {section.max_words > 0 && ` / max ${section.max_words}`}
        </div>
      </div>

      <RichTextEditor
        content={content.content || ''}
        onChange={(html) => onChange({ ...content, section_id: section.id, content: html })}
        placeholder={`Contenu de la section "${section.label}"...`}
      />

      {(isUnderMin || isOverMax) && (
        <p className={`text-xs mt-2 ${isUnderMin ? 'text-red-500' : 'text-amber-500'}`}>
          {isUnderMin && `Le contenu doit contenir au moins ${section.min_words} mots`}
          {isOverMax && `Le contenu ne doit pas dépasser ${section.max_words} mots`}
        </p>
      )}
    </div>
  );
}
