import { Layers } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-gray-900" />
            </div>
            <span className="font-bold">SEO CMS</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} SEO CMS — Génération et publication massive de pages web
          </p>
        </div>
      </div>
    </footer>
  );
}
