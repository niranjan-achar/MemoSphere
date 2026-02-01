import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NotesClient from '@/components/notes/NotesClient';

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return <NotesClient user={user} />;
}
