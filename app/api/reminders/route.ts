import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { getReminders, createReminder } from '@/lib/supabase/queries';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminders = await getReminders(user.id);
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.datetime) {
      return NextResponse.json({ error: 'Title and datetime are required' }, { status: 400 });
    }

    const reminder = await createReminder({
      user_id: user.id,
      title: body.title,
      description: body.description || null,
      datetime: body.datetime,
      repeat: body.repeat || 'none',
      status: body.status || 'pending',
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error: any) {
    console.error('Create reminder error:', error);
    return NextResponse.json({
      error: 'Failed to create reminder',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
