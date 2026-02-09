/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PagePreview from '@/components/editor/PagePreview';

// Mock sanitizeHTML for jsdom (DOMPurify needs a real DOM)
jest.mock('@/lib/sanitize', () => ({
  sanitizeHTML: (html: string) => html,
}));

describe('PagePreview Component', () => {
  it('renders the browser bar with slug', () => {
    render(<PagePreview page={{ slug: 'test-page' }} />);
    expect(screen.getByText('example.com/test-page')).toBeInTheDocument();
  });

  it('renders default slug when none provided', () => {
    render(<PagePreview page={{}} />);
    expect(screen.getByText('example.com/slug-page')).toBeInTheDocument();
  });

  it('renders the preview iframe', () => {
    render(
      <PagePreview
        page={{ slug: 'test', h1: 'Test Title', content: '<p>Content</p>' }}
      />
    );
    const iframe = screen.getByTitle('Aperçu de la page');
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe('IFRAME');
  });

  it('renders with sections', () => {
    const sections = [
      { id: 's1', type: 'hero' as const, label: 'Hero', required: true, min_words: 0, max_words: 500, order: 0 },
    ];
    const sectionContents = [
      { section_id: 's1', content: '<div class="bg-blue-500">Hero Content</div>' },
    ];
    render(
      <PagePreview
        page={{ slug: 'test' }}
        sections={sections}
        sectionContents={sectionContents}
      />
    );
    const iframe = screen.getByTitle('Aperçu de la page');
    expect(iframe).toBeInTheDocument();
  });

  it('renders the browser chrome dots', () => {
    const { container } = render(<PagePreview page={{ slug: 'test' }} />);
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(3);
  });
});
