import Link from 'next/link';
import { Layers } from 'lucide-react';

export default function PublicHeader() {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">SEO CMS</span>
          </Link>
          <Link
            href="/admin"
            className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all"
          >
            Administration
          </Link>
        </div>
      </div>
    </nav>
  );
}
