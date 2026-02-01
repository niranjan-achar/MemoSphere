import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/route-handler';
import { upsertUser } from '@/lib/supabase/queries';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Create or update user profile in public.users table
      try {
        await upsertUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name ||
            data.user.user_metadata?.full_name ||
            data.user.email?.split('@')[0] || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          preferences: {
            theme: 'system',
            notifications_enabled: true,
            timezone: 'UTC',
            language: 'en',
            likes: [],
            dislikes: [],
            custom_fields: {}
          }
        });
        console.log('✅ User profile created/updated for:', data.user.email);
      } catch (err) {
        console.error('❌ Failed to create user profile:', err);
        // Continue anyway - user can still use the app
      }
    }
  }

  // Redirect to dashboard after successful auth
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  return NextResponse.redirect(new URL('/dashboard', baseUrl));
}
