'use client';

import type { PageStatus } from '@/types/database';

const STATUS_CONFIG: Record<PageStatus, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
  published: { label: 'Publiée', className: 'bg-emerald-100 text-emerald-700' },
  archived: { label: 'Archivée', className: 'bg-orange-100 text-orange-700' },
  error: { label: 'Erreur', className: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }: { status: PageStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
