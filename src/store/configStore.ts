'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase-client';
import type { PublicationConfig } from '@/types/database';

interface ConfigState {
  siteUrl: string;
  publicationConfig: PublicationConfig | null;
  isLoading: boolean;
  setSiteUrl: (url: string) => void;
  loadPublicationConfig: () => Promise<void>;
  updatePublicationConfig: (config: Partial<PublicationConfig>) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  publicationConfig: null,
  isLoading: false,

  setSiteUrl: (url) => set({ siteUrl: url }),

  loadPublicationConfig: async () => {
    set({ isLoading: true });
    const supabase = createClient();
    const { data } = await supabase
      .from('publication_config')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    set({ publicationConfig: data, isLoading: false });
  },

  updatePublicationConfig: async (config) => {
    const supabase = createClient();
    const current = get().publicationConfig;
    if (current) {
      const { data } = await supabase
        .from('publication_config')
        .update({ ...config, updated_at: new Date().toISOString() })
        .eq('id', current.id)
        .select()
        .single();
      set({ publicationConfig: data });
    } else {
      const { data } = await supabase
        .from('publication_config')
        .insert({ pages_per_day: 10, is_active: false, ...config })
        .select()
        .single();
      set({ publicationConfig: data });
    }
  },
}));
