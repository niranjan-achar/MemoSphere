import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { getTodos, createTodo } from '@/lib/supabase/queries';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todos = await getTodos(user.id);
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 });
    }

    const todoData = await request.json();
    console.log('Creating todo with data:', { ...todoData, user_id: user.id });
    
    const newTodo = await createTodo({
      ...todoData,
      user_id: user.id,
    });

    console.log('Todo created successfully:', newTodo);
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error: any) {
    console.error('Create todo error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return NextResponse.json({ 
      error: 'Failed to create todo',
      message: error.message,
      details: error.details,
      hint: error.hint
    }, { status: 500 });
  }
}
