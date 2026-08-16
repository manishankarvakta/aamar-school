import { getAllAnnouncements } from '@/app/actions/announcements';
import { AnnouncementsClient } from './_components/announcements-client';

export default async function AnnouncementsPage() {
  const result = await getAllAnnouncements();

  return (
    <AnnouncementsClient
      initialData={result.data as any}
      initialStats={result.stats}
    />
  );
}