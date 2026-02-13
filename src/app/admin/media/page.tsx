import MediaGallery from '@/components/media/MediaGallery';

export const metadata = {
  title: 'Médiathèque | Admin CMS',
};

export default function MediaPage() {
  return (
    <div className="p-8">
      <MediaGallery />
    </div>
  );
}
