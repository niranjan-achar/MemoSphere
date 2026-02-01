import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { createHash } from 'crypto';

// Hash PIN for secure storage
function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex');
}

// Check if user has set a PIN
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('vault_pin_hash')
      .eq('id', user.id)
        .single() as { data: { vault_pin_hash: string | null } | null; error: any };

    if (error) {
      return NextResponse.json({ hasPin: false });
    }

    return NextResponse.json({ hasPin: !!userData?.vault_pin_hash });
  } catch (error) {
    console.error('Check PIN error:', error);
    return NextResponse.json({ error: 'Failed to check PIN' }, { status: 500 });
  }
}

// Set or update PIN
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pin } = await request.json();

    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 });
    }

    const pinHash = hashPin(pin);

    const { error } = await supabase
      .from('users')
      .update({ vault_pin_hash: pinHash })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set PIN error:', error);
    return NextResponse.json({ error: 'Failed to set PIN' }, { status: 500 });
  }
}

// Verify PIN
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN required' }, { status: 400 });
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('vault_pin_hash')
      .eq('id', user.id)
        .single() as { data: { vault_pin_hash: string | null } | null; error: any };

    if (error || !userData?.vault_pin_hash) {
      return NextResponse.json({ error: 'No PIN set' }, { status: 404 });
    }

    const pinHash = hashPin(pin);
    const isValid = pinHash === userData.vault_pin_hash;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Verify PIN error:', error);
    return NextResponse.json({ error: 'Failed to verify PIN' }, { status: 500 });
  }
}
