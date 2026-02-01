import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { updateVaultItem } from '@/lib/supabase/queries';
import { encryptVaultData } from '@/lib/encryption';

export async function PATCH(
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
    const { label, category, data } = await request.json();

    const updates: any = {};
    if (label) updates.label = label;
    if (category) updates.category = category;
    if (data) updates.data_encrypted = encryptVaultData(data);

    const updatedItem = await updateVaultItem(itemId, updates);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Update vault item error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from('vault')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete vault item error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
