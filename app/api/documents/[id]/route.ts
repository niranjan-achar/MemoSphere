import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { updateDocument, deleteDocument } from '@/lib/supabase/queries';

export async function PATCH(
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
    const updates = await request.json();
    const updatedDocument = await updateDocument(id, updates);

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Get document to find storage path
    const { data: document } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single() as { data: { storage_path?: string } | null };

    if (document?.storage_path) {
      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([document.storage_path]);
    }

    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
