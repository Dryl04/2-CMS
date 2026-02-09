import { SEOMetadata } from '../lib/supabase';
import Header from './Header';
import Footer from './Footer';

interface SEOPageViewerProps {
  page: SEOMetadata;
  onEdit: () => void;
  onBack: () => void;
}

export default function SEOPageViewer({ page }: SEOPageViewerProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header showSettings={false} />

      {page.content ? (
        <div
          className="pt-32"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <section className="pt-32 pb-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-12">
              <h1 className="text-5xl font-serif font-bold text-gray-900 mb-6">{page.title}</h1>
              {page.description && (
                <p className="text-xl text-gray-600">{page.description}</p>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
