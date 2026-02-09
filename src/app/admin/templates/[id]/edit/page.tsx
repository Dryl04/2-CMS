'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import TemplateConfigurator from '@/components/templates/TemplateConfigurator';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { PageTemplate } from '@/types/database';

export default function EditTemplatePage() {
  const params = useParams();
  const [template, setTemplate] = useState<PageTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        toast.error('Modèle introuvable');
      } else {
        setTemplate(data);
      }
      setIsLoading(false);
    };
    load();
  }, [params.id]);

  if (isLoading) return <LoadingSpinner />;
  if (!template) return <p className="text-center text-gray-500 py-12">Modèle introuvable</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modifier le modèle</h1>
        <p className="text-gray-500 mt-1">{template.name}</p>
      </div>
      <TemplateConfigurator template={template} />
    </div>
  );
}
