import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TodosClient from '@/components/todos/TodosClient';

export default async function TodosPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return <TodosClient user={user} />;
}
