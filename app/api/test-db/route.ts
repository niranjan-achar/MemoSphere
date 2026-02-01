import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: authError?.message 
      }, { status: 401 });
    }

    // Test database connection by checking if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('todos')
      .select('id')
      .limit(1);

    if (tablesError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: tablesError.message,
        code: tablesError.code,
        details: tablesError.details,
        hint: tablesError.hint,
        user: { id: user.id, email: user.email }
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'All systems operational',
      user: { id: user.id, email: user.email },
      database: 'connected'
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
}
