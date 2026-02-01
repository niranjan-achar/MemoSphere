// Frontend API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://memo-sphere-backend.vercel.app';

// Helper function to get authorization header
export const getAuthHeaders = async () => {
  // Get Supabase session token
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
  };
};

// API fetch wrapper with auth
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(options.headers as Record<string, string> || {}),
    };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
      headers,
  });

  return response;
}
