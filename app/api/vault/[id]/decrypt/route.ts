import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { decryptVaultData } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const itemId = params.id;

    const { data: item, error } = await supabase
      .from('vault')
      .select('*')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .single();

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
