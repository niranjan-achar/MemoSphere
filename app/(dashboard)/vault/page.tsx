import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VaultClient from '@/components/vault/VaultClient';

export default async function VaultPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth/login');
  }

  return <VaultClient user={user} />;
}
