/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({ id: 'test-id' }),
}));

// Mock supabase client
const mockPageData = {
  id: 'test-id',
  page_key: 'test-page',
  slug: 'test-page',
  title: 'Test Page',
  meta_description: 'Test description',
  h1: 'Test H1',
  h2: null,
  keywords: ['test'],
  content: '<p>Test content</p>',
  status: 'draft',
  is_public: true,
  exclude_from_sitemap: false,
  template_id: null,
  sections_content: null,
};

jest.mock('@/lib/supabase-client', () => ({
  createClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: table === 'seo_metadata' ? mockPageData : null, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  }),
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock RichTextEditor (complex TipTap dependency)
jest.mock('@/components/ui/RichTextEditor', () => {
  return function MockRichTextEditor({ content, onChange, placeholder }: { content: string; onChange: (html: string) => void; placeholder?: string }) {
    return (
      <textarea
        data-testid="rich-text-editor"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  };
});

// Mock PagePreview
jest.mock('@/components/editor/PagePreview', () => {
  return function MockPagePreview() {
    return <div data-testid="page-preview">Preview</div>;
  };
});

import PageEditor from '@/components/editor/PageEditor';

describe('PageEditor Component', () => {
  it('renders the new page form', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    expect(screen.getByText('Nouvelle page')).toBeInTheDocument();
  });

  it('shows save button', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    expect(screen.getByText('Sauvegarder')).toBeInTheDocument();
  });

  it('shows submit button for draft pages', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    expect(screen.getByText('Soumettre')).toBeInTheDocument();
  });

  it('renders all editor tabs', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    expect(screen.getByText('SEO & Méta')).toBeInTheDocument();
    expect(screen.getByText('Contenu')).toBeInTheDocument();
    expect(screen.getByText('Aperçu')).toBeInTheDocument();
  });

  it('renders publication sidebar', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    expect(screen.getByText('Publication')).toBeInTheDocument();
  });

  it('renders visibility toggle', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    expect(screen.getByText('Publique')).toBeInTheDocument();
    expect(screen.getByText('Privée')).toBeInTheDocument();
  });

  it('renders status selector with default value', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
  });

  it('switches tabs when clicking on Contenu', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Contenu'));
    });
    expect(screen.getByText('Modèle de page')).toBeInTheDocument();
  });

  it('shows character count information', async () => {
    await act(async () => {
      render(<PageEditor />);
    });
    expect(screen.getByText('Informations')).toBeInTheDocument();
  });
});
