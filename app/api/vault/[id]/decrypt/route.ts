import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { decryptVaultData } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: item, error } = await supabase
      .from('vault')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single() as { data: { data_encrypted: string } | null; error: any };

    if (error || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Decrypt the data
    const decryptedData = decryptVaultData(item.data_encrypted);

    return NextResponse.json(decryptedData);
  } catch (error) {
    console.error('Decrypt vault item error:', error);
    return NextResponse.json({ error: 'Failed to decrypt item' }, { status: 500 });
  }
}
