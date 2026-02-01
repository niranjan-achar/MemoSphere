import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { upsertUser } from '@/lib/supabase/queries';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', baseUrl));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('❌ Auth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', baseUrl));
  }

  if (data.user) {
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

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', baseUrl));
}
