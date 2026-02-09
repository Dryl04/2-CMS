'use client';

import type { PageStatus } from '@/types/database';
import { FileText, Clock, CheckCircle, Archive, AlertTriangle } from 'lucide-react';

interface StatusCardsProps {
  counts: Record<PageStatus, number>;
  total: number;
  activeFilter: PageStatus | 'all';
  onFilterChange: (status: PageStatus | 'all') => void;
}

const STATUS_ITEMS: { status: PageStatus | 'all'; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'all', label: 'Total', icon: FileText, color: 'bg-gray-100 text-gray-700' },
  { status: 'draft', label: 'Brouillons', icon: FileText, color: 'bg-gray-100 text-gray-600' },
  { status: 'pending', label: 'En attente', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { status: 'published', label: 'Publiées', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  { status: 'archived', label: 'Archivées', icon: Archive, color: 'bg-orange-100 text-orange-700' },
  { status: 'error', label: 'Erreurs', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
];

export default function StatusCards({ counts, total, activeFilter, onFilterChange }: StatusCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {STATUS_ITEMS.map((item) => {
        const count = item.status === 'all' ? total : (counts[item.status] || 0);
        const active = activeFilter === item.status;
        return (
          <button
            key={item.status}
            onClick={() => onFilterChange(item.status)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              active ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </button>
        );
      })}
    </div>
  );
}
