'use client';

import { useParams } from 'next/navigation';
import PageEditor from '@/components/editor/PageEditor';

export default function EditPageRoute() {
  const params = useParams();
  return <PageEditor pageId={params.id as string} />;
}
