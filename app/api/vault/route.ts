import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { getVaultItems, createVaultItem } from '@/lib/supabase/queries';
import { encryptVaultData } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vaultItems = await getVaultItems(user.id);
    return NextResponse.json(vaultItems);
  } catch (error) {
    console.error('Get vault items error:', error);
    return NextResponse.json({ error: 'Failed to fetch vault items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { label, category, data } = await request.json();

    // Encrypt the vault data
    const encryptedData = encryptVaultData(data);

    const newItem = await createVaultItem({
      user_id: user.id,
      label,
      category,
      data_encrypted: encryptedData,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Create vault item error:', error);
    return NextResponse.json({ error: 'Failed to create vault item' }, { status: 500 });
  }
}
