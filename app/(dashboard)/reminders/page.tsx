import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RemindersClient from '@/components/reminders/RemindersClient';

export default async function RemindersPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return <RemindersClient user={user} />;
}
