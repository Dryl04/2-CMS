import InternalLinksRules from '@/components/seo/InternalLinksRules';
import SitemapManager from '@/components/seo/SitemapManager';

export default function SEOSettingsPage() {
    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres SEO</h1>
                <p className="text-gray-500 mt-1">Configurez le maillage interne et le sitemap</p>
            </div>
            <InternalLinksRules />
            <div className="border-t border-gray-200 pt-10">
                <SitemapManager />
            </div>
        </div>
    );
}
