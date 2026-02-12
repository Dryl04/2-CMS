import RedirectsManager from '@/components/seo/RedirectsManager';

export const metadata = {
  title: 'Redirections | Admin CMS',
};

export default function RedirectsPage() {
  return (
    <div className="p-8">
      <RedirectsManager />
    </div>
  );
}
