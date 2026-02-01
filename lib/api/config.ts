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
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  return response;
}
