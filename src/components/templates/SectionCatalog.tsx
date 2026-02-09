'use client';

import { SECTION_CATALOG, type SectionType } from '@/types/database';
import { Plus, Layout, FileText, Image, MousePointer, HelpCircle, MessageSquare, Grid, List, BarChart3, Mail } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Layout, FileText, Image, MousePointer, HelpCircle, MessageSquare, Grid, List, BarChart3, Mail,
};

interface SectionCatalogProps {
  onAdd: (type: SectionType) => void;
  usedTypes?: SectionType[];
}

export default function SectionCatalog({ onAdd, usedTypes = [] }: SectionCatalogProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.entries(SECTION_CATALOG) as [SectionType, typeof SECTION_CATALOG[SectionType]][]).map(([type, config]) => {
        const Icon = ICON_MAP[config.icon] || FileText;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onAdd(type)}
            className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-left"
          >
            <Icon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{config.label}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{config.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
