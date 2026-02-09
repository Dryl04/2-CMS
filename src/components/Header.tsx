import { Users, Settings } from 'lucide-react';

interface HeaderProps {
  onSettingsClick?: () => void;
  showSettings?: boolean;
}

export default function Header({ onSettingsClick, showSettings = false }: HeaderProps) {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">NetworkPro</span>
          </a>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Témoignages</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
              Démo
            </button>
            {showSettings && onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2"
                title="Gestion SEO"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-all duration-300">
              Commencer
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
